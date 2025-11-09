export const requireParent = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                EC: -1,
                EM: "Chưa xác thực người dùng, vui lòng đăng nhập.",
                DT: {},
            });
        }

        if (req.user.role !== "PARENT") {
            return res.status(403).json({
                EC: -1,
                EM: "Chỉ tài khoản phụ huynh mới được phép thực hiện hành động này.",
                DT: {},
            });
        }

        next();
    } catch (error) {
        console.log("Lỗi khi xác minh quyền phụ huynh", error);
        return res.status(500).json({
            EC: -1,
            EM: "Lỗi server",
            DT: {},
        });
    }
};
