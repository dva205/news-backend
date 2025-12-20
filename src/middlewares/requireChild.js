import { sendError } from "../utils/ApiResponse.js";

export const requireChild = (req, res, next) => {
    try {
        if (!req.user) {
            return sendError(res, {
                statusCode: 401,
                message: "Chưa xác thực người dùng, vui lòng đăng nhập."
            });
        }

        if (req.user.role !== "CHILD") {
            return sendError(res, {
                statusCode: 403,
                message: "Chỉ tài khoản con mới được phép thực hiện hành động này."
            });
        }

        next();
    } catch (error) {
        console.log("Lỗi khi xác minh quyền con", error);
        return res.status(500).json({
            EM: "Lỗi server",
            DT: {},
        });
    }
};
