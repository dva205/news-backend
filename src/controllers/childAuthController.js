import { validateInviteCode, signInChild, signOutChild, refreshChildToken, activeChildAccount } from '../services/childAuthService.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

export const validateInvite = async (req, res) => {
    try {
        const code = req.query?.code;

        if (!code) {
            return sendError(res, {
                statusCode: 400,
                message: "Thiếu mã mời"
            });
        }

        // 2. Gọi Service
        const data = await validateInviteCode(code);

        // 3. Trả Response 
        return sendSuccess(res, data, "Link hợp lệ", 200);

    } catch (error) {
        console.error("Lỗi khi validate link", error);
        return sendError(res, error);
    }
}


export const activateChildAccount = async (req, res) => {
    try {
        const { code, password } = req.body;

        // 1. Validate
        if (!password || !code) {
            return sendError(res, {
                statusCode: 400,
                message: "Mã kích hoạt tài khoản và mật khẩu không được để trống"
            });
        }

        // 2. Gọi Service
        const data = await activeChildAccount(code, password);

        // 3. Trả Response 
        return sendSuccess(res, data, "Kích hoạt thành công", 200);

    } catch (error) {
        console.log("Lỗi khi activate child account", error);
        return sendError(res, error);
    }
}


export const childSignIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate
        if (!username || !password) {
            return sendError(res, {
                statusCode: 400,
                message: "Tên đăng nhập và mật khẩu không được để trống"
            });
        }

        // 2. Gọi Service
        const data = await signInChild(username, password);

        // 3. Đặt Cookie 
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            // secure: true,
            sameSite: "none",
            maxAge: data.REFRESH_TOKEN_TTL
        });

        // 4. Trả Response
        const responseData = {
            ...data.user,
            accessToken: data.accessToken
        };

        return sendSuccess(res, responseData, "Đăng nhập thành công", 200);
    } catch (error) {
        console.log("Lỗi khi child đăng nhập", error);
        return sendError(res, error);
    }
}


export const childSignOut = async (req, res) => {
    try {
        // 1. Lấy token
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return sendError(res, {
                statusCode: 401,
                message: "Thiếu refresh token"
            });
        }

        // 2. Gọi Service 
        await signOutChild(refreshToken);

        // 3. Xóa Cookie 
        res.clearCookie("refreshToken", {
            httpOnly: true,
            // secure: true,
            sameSite: "none"
        });

        // 4. Trả Response
        return sendSuccess(res, null, "Đăng xuất thành công", 200);

    } catch (error) {
        console.log("Lỗi khi child sign out", error);
        return sendError(res, error);
    }
}


export const refreshToken = async (req, res) => {
    try {
        // 1. Lấy token
        const token = req.cookies?.refreshToken;

        if (!token) {
            return sendError(res, {
                statusCode: 401,
                message: "Token không tồn tại"
            });
        }

        // 2. Gọi Service
        const data = await refreshChildToken(token);

        // 3. Trả Response
        return sendSuccess(res, data, "Làm mới token thành công", 200);

    } catch (error) {
        console.log("Lỗi khi gọi refreshToken", error);
        return sendError(res, error);
    }
}