import { signUpParent, signInParent, signOutParent, refreshParentToken, updateParentProfile } from '../services/parentAuthService.js';

export const parentSignUp = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // 1. Validate 
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                EM: "Email, password, firstName, lastName không được để trống",
                DT: {}
            });
        }

        // 2. Gọi Service 
        const newUser = await signUpParent(email, password, firstName, lastName);

        // 3. Trả Response 
        return res.status(200).json({
            EM: "Đăng kí thành công",
            DT: newUser
        });

    } catch (error) {
        console.error("Lỗi khi tạo tài khoản cho bố mẹ", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

export const parentSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate
        if (!email || !password) {
            return res.status(400).json({
                EM: "Email và password không được để trống",
                DT: {}
            })
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
        return res.status(200).json({
            EM: "Đăng nhập thành công",
            DT: {
                accessToken: data.accessToken
            }
        });

    } catch (error) {
        console.error("Lỗi khi parent đăng nhập", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const parentSignOut = async (req, res) => {
    try {
        // 1. Lấy token từ cookie
        const refreshToken = req.cookies?.refreshToken;

        // 2. Gọi Service 
        await signOutParent(refreshToken);

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
        console.error("Lỗi khi parent sign out", error);
        return res.status(500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const refreshToken = async (req, res) => {
    try {
        // 1. Lấy token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({
                EM: "Refresh Token không tồn tại",
                DT: {}
            })
        }

        // 2. Gọi Service
        const data = await refreshParentToken(token);

        // 3. Trả Response
        return res.status(200).json({
            EM: "Làm mới token thành công",
            DT: {
                accessToken: data.accessToken
            }
        });

    } catch (error) {
        console.error("Lỗi khi gọi refreshToken", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const parentId = req.user.id;
        const { firstName, lastName, email } = req.body;

        // Validate: Check nếu có lỗi từ fileFilter
        if (req.fileValidationError) {
            return res.status(400).json({
                EM: req.fileValidationError,
                DT: {}
            });
        }

        // Validate: Check auth
        if (!parentId) {
            return res.status(401).json({
                EM: "Unauthorized",
                DT: {}
            });
        }

        // Validate: Check required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                EM: "FirstName, lastName, email không được để trống",
                DT: {}
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

        return res.status(200).json({
            EM: "Cập nhật thông tin thành công",
            DT: data
        });

    } catch (error) {
        console.error("Lỗi khi update parent profile", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}