export const requireChild = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                EM: "Chưa xác thực người dùng, vui lòng đăng nhập.",
                DT: {},
            });
        }

        if (req.user.role !== "CHILD") {
            return res.status(403).json({
                EM: "Chỉ tài khoản con mới được phép thực hiện hành động này.",
                DT: {},
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
