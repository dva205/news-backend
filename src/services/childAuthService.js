import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import db from '../models/index.js';
import crypto from "crypto";
import { Op } from "sequelize";
import { ApiError } from '../utils/ApiError.js';

export const validateInviteCode = async (code) => {
    // 1. Tìm invite
    const invite = await db.Invite.findOne({
        where: { code }
    });

    if (!invite) {
        throw new ApiError("Link không tồn tại hoặc không hợp lệ", 404);
    }

    // 2. Kiểm tra hết hạn
    if (invite.expires_at < new Date()) {
        throw new ApiError("Link đã hết hạn", 400);
    }

    // 3. Kiểm tra đã dùng chưa
    if (invite.used) {
        throw new ApiError("Link này đã được sử dụng", 400);
    }

    // 4. Lấy thông tin phụ huynh (người mời)
    const parent = await db.User.findByPk(invite.parent_id);
    if (!parent) {
        // Lỗi hiếm gặp: invite tồn tại nhưng parent bị xóa
        throw new ApiError("Không tìm thấy người mời", 404);
    }

    // 5. Trả về thông tin phụ huynh
    return {
        parent: {
            id: parent.id,
            display_name: parent.display_name
        }
    };
}

export const activeChildAccount = async (code, password) => {
    // Dùng transaction để đảm bảo cả 2 update cùng thành công
    const t = await db.sequelize.transaction();

    try {
        // 1. Tìm invite và KHÓA nó lại để update, đảm bảo an toàn
        const invite = await db.Invite.findOne({
            where: { code },
            lock: t.LOCK.UPDATE // Ngăn race condition
        });

        // 2. Validate invite
        if (!invite) {
            throw new ApiError("Invite không hợp lệ", 404);
        }
        if (invite.used || invite.expires_at < new Date()) {
            throw new ApiError("Invite đã hết hạn hoặc đã dùng", 410);
        }

        // 3. Tìm tài khoản con
        const child = await db.User.findByPk(invite.child_id, { transaction: t });
        if (!child || child.role !== "CHILD") {
            throw new ApiError("Không tìm thấy tài khoản con", 404);
        }

        // 4. Hash password mới
        const passwordHash = await bcrypt.hash(password, 10);

        // 5. Update tài khoản con (với transaction)
        await child.update({
            password_hashed: passwordHash
        }, { transaction: t });

        // 6. Đánh dấu invite đã dùng (với transaction)
        await invite.update({
            used: true
        }, { transaction: t });

        // 7. Nếu mọi thứ OK, commit transaction
        await t.commit();

        // 8. Trả về thông tin child
        return {
            child: {
                id: child.id,
                username: child.username,
                display_name: child.display_name
            }
        };

    } catch (error) {
        // 9. Nếu có lỗi, rollback tất cả
        await t.rollback();
        // Ném lỗi để controller bắt
        if (error instanceof ApiError) throw error;
        throw new Error(`Lỗi kích hoạt: ${error.message}`);
    }
}


export const signInChild = async (username, password) => {
    // 1. Tìm user
    const existChild = await db.User.findOne({
        where: {
            username,
            role: "CHILD"
        }
    });

    if (!existChild) {
        throw new ApiError("Username hoặc password không chính xác", 404);
    }

    // Check if account is activated (has password)
    if (!existChild.password_hashed) {
        throw new ApiError("Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản bằng mật khẩu mới.", 403);
    }

    // 2. So sánh password
    const isCorrectPassword = await bcrypt.compare(password, existChild.password_hashed);
    if (!isCorrectPassword) {
        throw new ApiError("Username hoặc mật khẩu không chính xác", 400);
    }

    // 3. Tạo Access Token
    const payload = { id: existChild.id, role: existChild.role };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const ACCESS_TOKEN_TTL = "30m";
    const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL });

    // 4. Tạo Refresh Token (Raw)
    const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // 5. Tạo Session (Lưu token raw)
    await db.Session.create({
        user_id: existChild.id,
        refresh_token: refreshToken, // Lưu token raw, không hash
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
    });

    // 6. Trả về dữ liệu cho Controller
    return {
        user: {
            id: existChild.id,
            username: existChild.username,
            role: existChild.role,
            display_name: existChild.display_name,
        },
        accessToken,
        refreshToken,
        REFRESH_TOKEN_TTL
    };
}


export const signOutChild = async (refreshToken) => {
    if (!refreshToken) {
        return;
    }
    // Xóa session khớp với token raw
    await db.Session.destroy({
        where: {
            refresh_token: refreshToken
        }
    });
    return;
}

export const refreshChildToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError("Token không tồn tại", 401);
    }

    // 1. Tìm session khớp VÀ còn hạn
    const session = await db.Session.findOne({
        where: {
            refresh_token: refreshToken,
            expires_at: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!session) {
        throw new ApiError("Token không hợp lệ hoặc đã hết hạn", 403);
    }

    // 2. Lấy thông tin user
    const user = await db.User.findByPk(session.user_id);
    if (!user) {
        await session.destroy();
        throw new ApiError("Không tìm thấy người dùng", 403);
    }

    // 3. Tạo access token mới
    const payload = {
        id: user.id,
        role: user.role
    };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const ACCESS_TOKEN_TTL = "30m";
    const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL });

    // 4. Trả về token mới
    return { accessToken };
}