import { sendSuccess, sendError } from '../utils/ApiResponse.js';

export const getAccountController = (req, res) => {
    try {
        if (!req.user) {
            return sendError(res, {
                statusCode: 401,
                message: "Không tìm thấy thông tin người dùng"
            });
        }

        // Trả về thông tin user
        return sendSuccess(res, req.user, "Lấy thông tin tài khoản thành công", 200);

    } catch (error) {
        console.log("Lỗi khi lấy thông tin account", error);
        return sendError(res, error);
    }
}