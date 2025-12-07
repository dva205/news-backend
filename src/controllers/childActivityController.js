import { logTime } from "../services/childActivityService.js";
import { sendError, sendSuccess } from '../utils/ApiResponse.js'

export const logChildActivity = async (req, res) => {
    try {
        const childId = req.user.id;
        const { activeSeconds } = req.body;

        const activeSecond = parseInt(activeSeconds);

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        if (!activeSecond || activeSecond < 0) {
            return sendError(res, {
                statusCode: 400,
                message: "Số thời gian hoạt động không hợp lệ"
            });
        }

        const data = await logTime(childId, activeSecond);

        return sendSuccess(res, result, "Log hoạt động con thành công"), 200;
    } catch (error) {
        console.error("Lỗi khi gửi hoạt động của con:", error);
        return sendError(res, error);
    }
}