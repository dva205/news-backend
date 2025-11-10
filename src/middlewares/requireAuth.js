import jwt from "jsonwebtoken";
import db from "../models/index.js";

export const requireAuth = (req, res, next) => {
    try {
        // 1. Lấy Authorization header
        const authHeader = req.headers?.authorization;

        // 2. Kiểm tra có header không, và có đúng định dạng "Bearer <token>" không
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                EC: -1,
                EM: "Thiếu Authorization header hoặc token không hợp lệ",
                DT: {}
            });
        }

        const token = authHeader.split(" ")[1]; // lấy phần <token>

        // 3. Verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.log("JWT verify error:", err);

                return res.status(401).json({
                    EC: -1,
                    EM: "Access Token hết hạn hoặc không đúng",
                    DT: {}
                });
            }

            // 4. Tìm user trong DB
            const user = await db.User.findOne({
                where: { id: decodedUser.id },
                attributes: {
                    exclude: ["password_hashed"],
                },
            });

            if (!user) {
                return res.status(404).json({
                    EC: -1,
                    EM: "Người dùng không tồn tại",
                    DT: {}
                });
            }

            // 5. Gắn user vào req để route sau dùng
            req.user = user;

            // 6. Cho request đi tiếp
            next();
        });

    } catch (error) {
        console.log("Lỗi khi authorization", error);
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {}
        });
    }
};
