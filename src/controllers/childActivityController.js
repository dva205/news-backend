import { logTime } from "../services/childActivityService.js";

export const logChildActivity = async (req, res) => {
    try {
        const childId = req.user.id;

        const { activeSecond } = req.body;

        if (!activeSecond || activeSecond < 0) {
            return res.status(404).json({
                EM: "Số thời gian hoạt động không hợp lệ",
                DT: {}
            });
        }

        const data = await logTime(childId, activeSecond);

        return res.status(200).json({
            EM: "Log hoạt động con thành công",
            DT: { data }
        });
    } catch (error) {
        console.error("Lỗi khi gửi hoạt động của con:", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}