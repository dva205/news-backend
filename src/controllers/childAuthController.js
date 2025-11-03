import db from '../models/index.js';
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import { Op } from "sequelize";
import crypto from "crypto";
dotenv.config();

export const validateInvite = async (req, res) => {
    try {
        // lấy invite code ở url
        const code = req.query.invite;

        if (!code) {
            return res.status(400).json({
                EC: -1,
                EM: "Thiếu mã mời",
                DT: {}
            });
        }

        // so sánh với db
        const invite = await db.Invite.findOne({
            where: { code }
        })

        if (!invite) {
            return res.status(404).json({
                EC: -1,
                EM: "Link không tồn tại hoặc không hợp lệ",
                DT: {}
            });
        }

        // kiểm tra xem còn hạn không 
        if (invite.expires_at < new Date()) {
            return res.status(400).json({
                EC: -1,
                EM: "Link đã hết hạn",
                DT: {}
            });
        }

        // kiểm tra đã dùng chưa
        if (invite.used) {
            return res.status(400).json({
                EC: -1,
                EM: "Link này đã được sử dụng",
                DT: {}
            });
        }

        const parent = await db.User.findByPk(invite.parent_id)

        return res.status(200).json({
            EC: 0,
            EM: "Link hợp lệ",
            DT: {
                parent: {
                    id: parent.id,
                    display_name: parent.display_name
                }
            }
        })

    } catch (error) {
        console.log("Lỗi khi validate link", error)
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }
}

export const activateChildAccount = async (req, res) => {
    try {
        const { code, password } = req.body;

        if (!password) {
            return res.status(400).json({
                EC: -1,
                EM: "Password không được để trống",
                DT: {}
            });
        }

        if (!code) {
            return res.status(400).json({
                EC: -1,
                EM: "Code không được để trống",
                DT: {}
            });
        }

        const invite = await db.Invite.findOne({
            where: { code }
        })

        if (!invite) {
            return res.status(404).json({
                EC: -1,
                EM: "Invite không hợp lệ",
                DT: {}
            });
        }

        if (invite.used || invite.expires_at < new Date()) {
            return res.status(410).json({
                EC: -1,
                EM: "Invite đã hết hạn hoặc đã dùng",
                DT: {}
            });
        }

        const child = await db.User.findByPk(invite.child_id);

        if (!child || child.role !== "CHILD") {
            return res.status(404).json({
                EC: -1,
                EM: "Không tìm thấy tài khoản con",
                DT: {}
            })
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // update password
        const newChild = await child.update({
            password_hashed: passwordHash
        })

        // update link used
        await invite.update({
            used: true
        })

        return res.status(200).json({
            EC: 0,
            EM: "Kích hoạt thành công",
            DT: {
                child: {
                    id: child.id,
                    username: child.username,
                    display_name: child.display_name
                }
            }
        })
    } catch (error) {
        console.log("Lỗi khi activate child account", error)
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }
}

export const childSignIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                EC: -1,
                EM: "Username , password không được để trống",
                DT: {}
            });
        }

        const existChild = await db.User.findOne({
            where: {
                username,
                role: "CHILD"
            }
        })

        if (!existChild) {
            return res.status(404).json({
                EC: -1,
                EM: "Username hoặc password không chính xác",
                DT: {}
            });
        }

        const isCorrectPassword = await bcrypt.compare(password, existChild.password_hashed)

        if (!isCorrectPassword) {
            return res.status(400).json({
                EC: -1,
                EM: "Username hoặc mật khẩu không chính xác",
                DT: {}
            });
        }

        // tạo access token
        const payload = {
            id: existChild.id,
            role: existChild.role
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const ACCESS_TOKEN_TTL = "30m";

        const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL })

        // tạo refresh token
        const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

        const refreshTokenRaw = crypto.randomBytes(64).toString("hex");

        const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10);

        // Tạo session mới để lưu refresh token vào db
        await db.Session.create({
            user_id: existChild.id,
            refresh_token_hash: refreshTokenHash,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        // trả refresh token về cookie
        res.cookie('refreshToken', refreshTokenRaw, {
            httpOnly: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL
        })

        return res.status(200).json({
            EC: 0,
            EM: "Đăng nhập thành công",
            DT: {
                id: existChild.id,
                username: existChild.username,
                role: existChild.role,
                display_name: existChild.display_name,
                accessToken
            }
        });

    } catch (error) {
        console.log("Lỗi khi child đăng nhập", error)
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }
}

export const childSignOut = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const refreshTokenRaw = req.cookies?.refreshToken;

        if (!refreshTokenRaw) {
            // Không có cookie -> coi như đã đăng xuất
            return res.status(200).json({
                EC: 0,
                EM: "Không có phiên nào để đăng xuất (đã logout)",
                DT: {}
            });
        }

        // tìm session còn hạn
        const sessions = await db.Session.findAll({
            where: {
                expires_at: {
                    [Op.gt]: new Date() // expires_at < Date.now()
                }
            }
        })

        // dùng bcrypt so sánh
        let matchedSession = null;
        for (const session of sessions) {
            // so sánh token ở cookie và token ở session trong db
            const isMatch = await bcrypt.compare(refreshTokenRaw, session.refresh_token_hash);

            if (isMatch) {
                matchedSession = session;
                break;
            }
        }

        // xóa token ở db 
        if (matchedSession) {
            await matchedSession.destroy()
        }

        // xóa cookie phía client
        res.clearCookie("refreshToken");

        return res.status(200).json({
            EC: 0,
            EM: "Đăng xuất thành công",
            DT: {}
        });

    } catch (error) {
        console.log("Lỗi khi child sign out", error)
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }
}

export const refreshToken = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                EC: -1,
                EM: "Token không tồn tại",
                DT: {}
            })
        }
        // so sánh với refresh token trong db
        const session = await db.Session.findOne({
            where: {
                refresh_token_hash: token
            }
        })

        if (!session) {
            return res.status(403).json({
                EC: -1,
                EM: "Token không hợp lệ hoặc đã hết hạn",
                DT: {}
            })
        }
        // kiểm tra hết hạn chưa
        if (session.expires_at < new Date.now()) {
            return res.status(403).json({
                EC: -1,
                EM: "Token không hợp lệ hoặc đã hết hạn",
                DT: {}
            })
        }

        // tạo access token mới
        const payload = {
            user_id: session.user_id,
        };
        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const ACCESS_TOKEN_TTL = "30m";

        const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL });

        return res.status(200).json({
            EC: 0,
            EM: "",
            DT: accessToken
        })
    } catch (error) {
        console.log("Lỗi khi gọi refreshToken", error)
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        })
    }
}