import { signUpParent, signInParent, signOutParent, refreshParentToken, updateParentProfile } from '../services/parentAuthService.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

export const parentSignUp = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // 1. Validate 
        if (!email || !password || !firstName || !lastName) {
            return sendError(res, {
                statusCode: 400,
                message: "Tất cả các trường không được để trống"
            });
        }

        // 2. Gọi Service 
        await signUpParent(email, password, firstName, lastName);

        // 3. Trả Response 
        return sendSuccess(res, null, "Đăng kí thành công", 201);

    } catch (error) {
        console.error("Lỗi khi tạo tài khoản cho bố mẹ", error);
        return sendError(res, error);
    }
}

export const parentSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate
        if (!email || !password) {
            return sendError(res, {
                statusCode: 400,
                message: "Tất cả các trường không được để trống"
            });
        }

        // 2. Gọi Service
        const data = await signInParent(email, password);

        // 3. Đặt Cookie 
        res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: data.REFRESH_TOKEN_TTL
        });

        // 4. Trả Response
        return sendSuccess(res, { accessToken: data.accessToken }, "Đăng nhập thành công", 200);

    } catch (error) {
        console.error("Lỗi khi parent đăng nhập", error);
        return sendError(res, error);
    }
}


export const parentSignOut = async (req, res) => {
    try {
        // 1. Lấy token từ cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return sendError(res, {
                statusCode: 401,
                message: "Thiếu refresh token"
            });
        }

        // 2. Gọi Service 
        await signOutParent(refreshToken);

        // 3. Xóa Cookie 
        res.clearCookie("refreshToken", {
            httpOnly: true,
            // secure: true,
            sameSite: "lax"
        });

        // 4. Trả Response
        return sendSuccess(res, null, "Đăng xuất thành công", 200);

    } catch (error) {
        console.error("Lỗi khi parent sign out", error);
        return sendError(res, error);
    }
}


export const refreshToken = async (req, res) => {
    try {
        // 1. Lấy token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return sendError(res, {
                statusCode: 401,
                message: "Refresh Token không tồn tại"
            });
        }

        // 2. Gọi Service
        const data = await refreshParentToken(token);

        // 3. Trả Response
        return sendSuccess(res, { accessToken: data.accessToken }, null, 200);

    } catch (error) {
        console.error("Lỗi khi gọi refreshToken", error);
        return sendError(res, error);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { firstName, lastName, email } = req.body;

        // Validate: Check nếu có lỗi từ fileFilter
        if (req.fileValidationError) {
            return sendError(res, {
                statusCode: 400,
                message: req.fileValidationError
            });
        }

        // Validate: Check auth
        if (!parentId) {
            return sendError(res, {
                statusCode: 401,
                message: "Người dùng không có quyền thực hiện hành động này"
            });
        }

        // Validate: Check required fields
        if (!firstName || !lastName || !email) {
            return sendError(res, {
                statusCode: 400,
                message: "Họ, tên, email không được để trống"
            });
        }

        // Xử lý avatar URL nếu có file upload
        let avatarUrl = null;
        if (req.file) {
            // URL: http://localhost:5000/image/avatar-5-1234567890.jpg
            avatarUrl = `http://localhost:5000/image/${req.file.filename}`;
        }

        // Gọi service để update
        const data = await updateParentProfile(parentId, firstName, lastName, email, avatarUrl);

        return sendSuccess(res, data, "Cập nhật thông tin thành công", 200);

    } catch (error) {
        console.error("Lỗi khi update parent profile", error);
        return sendError(res, error);
    }
}