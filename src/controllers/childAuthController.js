import { validateInviteCode, signInChild, signOutChild, refreshChildToken, activeChildAccount } from '../services/childAuthService.js';


export const validateInvite = async (req, res) => {
    try {
        const code = req.query?.code;

        if (!code) {
            return res.status(400).json({
                EM: "Thiếu mã mời",
                DT: {}
            });
        }

        // 2. Gọi Service
        const data = await validateInviteCode(code);

        // 3. Trả Response 
        return res.status(200).json({
            EM: "Link hợp lệ",
            DT: data
        });

    } catch (error) {
        console.error("Lỗi khi validate link", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const activateChildAccount = async (req, res) => {
    try {
        const { code, password } = req.body;

        // 1. Validate
        if (!password || !code) {
            return res.status(400).json({
                EM: "Code và Password không được để trống",
                DT: {}
            });
        }

        // 2. Gọi Service
        const data = await activeChildAccount(code, password);

        // 3. Trả Response 
        return res.status(200).json({
            EM: "Kích hoạt thành công",
            DT: data
        });

    } catch (error) {
        console.log("Lỗi khi activate child account", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const childSignIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate
        if (!username || !password) {
            return res.status(400).json({
                EM: "Username và password không được để trống",
                DT: {}
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
        return res.status(200).json({
            EM: "Đăng nhập thành công",
            DT: {
                ...data.user,
                accessToken: data.accessToken
            }
        });
    } catch (error) {
        console.log("Lỗi khi child đăng nhập", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const childSignOut = async (req, res) => {
    try {
        // 1. Lấy token
        const refreshToken = req.cookies?.refreshToken;

        // 2. Gọi Service 
        await signOutChild(refreshToken);

        // 3. Xóa Cookie 
        res.clearCookie("refreshToken", {
            httpOnly: true,
            // secure: true,
            sameSite: "none"
        });

        // 4. Trả Response
        return res.status(200).json({
            EM: "Đăng xuất thành công",
            DT: {}
        });

    } catch (error) {
        console.log("Lỗi khi child sign out", error);
        return res.status(500).json({
            EM: "Lỗi server",
            DT: {}
        });
    }
}


export const refreshToken = async (req, res) => {
    try {
        // 1. Lấy token
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                EM: "Token không tồn tại",
                DT: {}
            });
        }

        // 2. Gọi Service
        const data = await refreshChildToken(token);

        // 3. Trả Response
        return res.status(200).json({
            EM: "Làm mới token thành công",
            DT: data
        });

    } catch (error) {
        console.log("Lỗi khi gọi refreshToken", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}