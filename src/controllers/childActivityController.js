import { getStreak, logTime, updateStreak } from "../services/childActivityService.js";
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

        return sendSuccess(res, data, "Log hoạt động con thành công", 200);
    } catch (error) {
        console.error("Lỗi khi gửi hoạt động của con:", error);
        return sendError(res, error);
    }
}

export const updateChildStreak = async (req, res) => {
    try {
        const childId = req.user.id;

        if (!childId) {
            return sendError(res, {
                statusCode: 401,
                message: "Nguời dùng không có quyền thực hiện hành động này"
            });
        }

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        const streak = await updateStreak(childId, today, yesterday)

        return sendSuccess(res, streak, 'Cập nhật chuỗi thành công', 200)
    } catch (error) {
        console.error('Lỗi khi gọi update streak', error);
        return sendError(res, error)
    }
}

export const getChildStreak = async (req, res) => {
    try {
        const childId = req.user.id;

        const now = new Date();
        const today = now.toISOString().split('T')[0];


        const data = await getStreak(childId, today);

        return sendSuccess(res, data, 'Xem chuỗi thành công', 200)
    } catch (error) {
        console.error('Lỗi khi gọi get streak', error);
        return sendError(res, error)
    }
}