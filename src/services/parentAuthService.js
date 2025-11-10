import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import db from '../models/index.js';
import crypto from "crypto";
import { Op } from "sequelize";
import { ApiError } from '../utils/ApiError.js';


export const signUpParent = async (email, password, firstName, lastName) => {
    const existUser = await db.User.findOne({ where: { email } })

    if (existUser) {
        throw new ApiError("Email đã tồn tại", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newParent = await db.User.create({
        email,
        password_hashed: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        role: "PARENT"
    });

    return {
        id: newParent.id,
        email: newParent.email,
        role: newParent.role,
        display_name: newParent.display_name,
    };
}


export const signInParent = async (email, password) => {
    const existUser = await db.User.findOne({
        where: {
            email,
            role: "PARENT"
        }
    });

    if (!existUser) {
        throw new ApiError("Email hoặc password không chính xác", 401);
    }

    const isCorrectPassword = await bcrypt.compare(password, existUser.password_hashed);

    if (!isCorrectPassword) {
        throw new ApiError("Email hoặc password không chính xác", 401);
    }

    const payload = { id: existUser.id, role: existUser.role };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const ACCESS_TOKEN_TTL = "30m";
    const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL });

    const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày
    const refreshToken = crypto.randomBytes(64).toString("hex");

    await db.Session.create({
        user_id: existUser.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL)
    });

    return {
        user: {
            id: existUser.id,
            email: existUser.email,
            role: existUser.role,
            display_name: existUser.display_name,
        },
        accessToken,
        refreshToken,
        REFRESH_TOKEN_TTL
    };
}



export const signOutParent = async (refreshToken) => {
    // Nếu không có token, không cần làm gì
    if (!refreshToken) {
        return;
    }


    await db.Session.destroy({
        where: {
            refresh_token: refreshToken
        }
    });

    return;
}


export const refreshParentToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError("Refresh Token không tồn tại", 401);
    }

    // 1. Tìm session khớp với token VÀ còn hạn
    const session = await db.Session.findOne({
        where: {
            refresh_token: refreshToken,
            expires_at: {
                [Op.gt]: new Date() // expires_at < now
            }
        }
    });

    if (!session) {
        throw new ApiError("Refresh Token không hợp lệ hoặc đã hết hạn", 403);
    }


    // 3. Lấy thông tin user để tạo payload mới
    const user = await db.User.findByPk(session.user_id);
    if (!user) {
        // Lỗi hiếm gặp: session tồn tại nhưng user bị xóa
        await session.destroy();
        throw new ApiError("Không tìm thấy người dùng của token", 403);
    }

    // 4. Tạo access token mới
    const payload = {
        id: user.id,
        role: user.role
    };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const ACCESS_TOKEN_TTL = "30m";

    const accessToken = jwt.sign(payload, secretKey, { expiresIn: ACCESS_TOKEN_TTL });


    return { accessToken };
}