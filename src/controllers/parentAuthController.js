import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import db from '../models/index.js';
import * as dotenv from 'dotenv';
import crypto from "crypto";
import { Op } from "sequelize";
dotenv.config();


export const parentSignUp = async (req, res) => {
    try {
        // lấy input
        const { email, password, firstName, lastName } = req.body;

        // validate
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                EC: -1,
                EM: "Email, password, firstName, lastName không được để trống",
                DT: {}
            });
        }

        const existUser = await db.User.findOne({ where: { email } })

        if (existUser) {
            return res.status(400).json({
                EC: -1,
                EM: "Email đã tồn tại",
                DT: {}
            });
        }

        // mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10);

        // tạo user mới
        const newParent = await db.User.create({
            email,
            password_hashed: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            role: "PARENT"
        });

        return res.status(200).json({
            EC: 0,
            EM: "Đăng kí thành công",
            DT: {
                id: newParent.id,
                email: newParent.email,
                role: newParent.role,
                display_name: newParent.display_name,
            }
        });

    } catch (error) {
        console.log("Lỗi khi tạo tài khoản cho bố mẹ", error);
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }

}

export const parentSignIn = async (req, res) => {
    try {
        // lấy input
        const { email, password } = req.body;

        // validate
        if (!email || !password) {
            return res.status(400).json({
                EC: -1,
                EM: "Email và password không được để trống",
                DT: {}
            })
        }

        const existUser = await db.User.findOne({
            where: {
                email,
                role: "PARENT"
            }
        })

        if (!existUser) {
            return res.status(400).json({
                EC: -1,
                EM: "Email hoặc password không chính xác",
                DT: {}
            })
        }

        // lấy password db đã hash so sánh với input
        const isCorrectPassword = await bcrypt.compare(password, existUser.password_hashed);

        if (!isCorrectPassword) {
            return res.status(401).json({
                EC: -1,
                EM: "Email hoặc password không chính xác",
                DT: {}
            })
        }

        // Tạo accessToken 
        const payload = {
            id: existUser.id,
            role: existUser.role
        };
        const secretKey = process.env.ACCESS_TOKEN_SECRET;
        const ACCESS_TOKEN_TTL = "30m";

        const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL, });

        // Tạo refresh token
        const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

        const refreshTokenRaw = crypto.randomBytes(64).toString("hex");

        const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10);

        // Tạo session mới để lưu refresh token vào db
        await db.Session.create({
            user_id: existUser.id,
            refresh_token_hash: refreshTokenHash,
            expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
        })


        // trả refresh token raw về cookie
        res.cookie('refreshToken', refreshTokenRaw, {
            httpOnly: true,
            // secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL
        })


        return res.status(200).json({
            EC: 0,
            EM: "Đăng nhập thành công",
            DT: {
                id: existUser.id,
                email: existUser.email,
                role: existUser.role,
                display_name: existUser.display_name,
                accessToken
            }
        })

    } catch (error) {
        console.log("Lỗi khi parent đăng nhập", error);
        return res.status(500).json({
            EC: -1,
            EM: "Internal Server Error",
            DT: {}
        });
    }

}

export const parentSignOut = async (req, res) => {
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
        console.log("Lỗi khi parent sign out", error);
        return res.status(500).json({
            EC: -1,
            EM: "Internal Server Error",
            DT: {}
        })
    }
}

export const refreshToken = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                EC: -1,
                EM: "Refresh Token không tồn tại",
                DT: {}
            })
        }

        // so sánh với refresh token trong db

        // tìm session còn hạn
        const sessions = await db.Session.findAll({
            where: {
                expires_at: {
                    [Op.gt]: new Date() // expires_at < Date.now()
                }
            }
        })

        // dùng bcrypt so sánh
        let session = null;
        for (const s of sessions) {
            // so sánh token ở cookie và token ở session trong db
            const isMatch = await bcrypt.compare(token, s.refresh_token_hash);

            if (isMatch) {
                session = s;
                break;
            }
        }


        if (!session) {
            return res.status(403).json({
                EC: -1,
                EM: "Refresh Token không hợp lệ hoặc đã hết hạn",
                DT: {}
            })
        }
        // kiểm tra hết hạn chưa
        if (session.expires_at < new Date()) {
            return res.status(403).json({
                EC: -1,
                EM: "Refresh Token không hợp lệ hoặc đã hết hạn",
                DT: {}
            })
        }

        // tạo access token mới
        const payload = {
            id: session.user_id,
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

