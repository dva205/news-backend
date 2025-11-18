import { createChildAccount, getAllChildren, getTimeLimit, setStrict, updateChild } from '../services/parentChildManagementService.js';


export const createAccountWithInviteLink = async (req, res) => {
    try {
        // 1. Lấy dữ liệu 
        const parentId = req.user.id;
        const { username, firstName, lastName, dob, gender } = req.body;

        // 2. Validate 
        if (!username || !firstName || !lastName || !dob || !gender) {
            return res.status(400).json({
                EM: "Tất cả các trường không được để trống",
                DT: {}
            });
        }

        // 3. Gọi Service 
        const data = await createChildAccount(parentId, {
            username, firstName, lastName, dob, gender
        });

        // 4. Xử lý Response 
        // Service trả về { newChild, newInvite }

        // Tạo URL (
        const inviteUrl = `http://localhost:5173/child/auth/signup?invite=${data.newInvite.code}`;

        return res.status(200).json({
            EM: "Đăng kí cho con thành công",
            DT: {
                id: data.newChild.id,
                username: data.newChild.username,
                role: data.newChild.role,
                display_name: data.newChild.display_name,
                dob: data.newChild.dob,
                gender: data.newChild.gender,
                parent_id: data.newChild.parent_id,
                newInvite: data.newInvite,
                inviteUrl
            }
        });

    } catch (error) {
        // 5. Bắt lỗi (từ Service hoặc lỗi khác)
        console.log("Lỗi khi tạo tài khoản cho con", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

export const getAllChild = async (req, res) => {
    try {
        // 1. Lấy dữ liệu
        const parentId = req?.user.id;
        if (!parentId) {
            return res.status(401).json({ EC: -1, EM: "Unauthorized", DT: {} });
        }

        // 2. Gọi Service
        const data = await getAllChildren(parentId);

        // 3. Trả Response
        return res.status(200).json({
            EM: `Bạn có ${data.children.length} tài khoản con`,
            DT: data
        });

    } catch (error) {
        console.log("Lỗi khi xem tài khoản con", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || 'Lỗi server',
            DT: {}
        });
    }
}

export const updateChildAccount = async (req, res) => {
    try {
        // 1. Lấy dữ liệu
        const childId = req.params.id;
        const parentId = req?.user?.id;
        const { firstName, lastName, dob, gender } = req.body;

        // 2. Validate 
        if (!childId) {
            return res.status(400).json({
                EM: "Thiếu ID của con",
                DT: {}
            });
        }
        if (!parentId) {
            return res.status(401).json({
                EM: "Unauthorized",
                DT: {}
            });
        }
        if (!firstName || !lastName) {
            return res.status(400).json({
                EM: "firstName và lastName không được để trống",
                DT: {}
            });
        }

        // 3. Gọi Service
        const data = await updateChild(parentId, childId, {
            firstName, lastName, dob, gender
        });

        // 4. Trả Response
        return res.status(200).json({
            EM: "Cập nhật tài khoản con thành công",
            DT: data
        });

    } catch (error) {
        console.log("Lỗi khi update tài khoản con", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}


export const setChildStrict = async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req.user.id;
        const { timeLimit, blockedKeyword, blockedCategory, blockedFeature } = req.body;


        if (!childId) {
            return res.status(400).json({
                EM: "Thiếu ID của con",
                DT: {}
            });
        }

        if (!parentId) {
            return res.status(401).json({
                EM: "Unauthorized",
                DT: {}
            });
        }

        const data = await setStrict(childId, parentId, timeLimit, blockedKeyword, blockedCategory, blockedFeature);

        return res.status(200).json({
            EM: "Cập nhật tài khoản các giới hạn cho con thành công",
            DT: data
        });
    } catch (error) {
        console.log("Lỗi khi update các giới hạn cho con", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

export const getChildActivity = async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req.user.id;
        const { timeRange } = req.body;

        if (!childId) {
            return res.status(404).json({
                EM: "Thiếu ID của con",
                DT: {}
            })
        }

        if (!parentId) {
            return res.status(401).json({
                EM: "Unauthorized",
                DT: {}
            });
        }

        const data = await getTimeLimit(childId, parentId, timeRange);

        return res.status(200).json({
            EM: "Xem hoạt động của con thành công",
            DT: data
        });
    } catch (error) {
        console.log("Lỗi khi update các giới hạn cho con", error);
        return res.status(error.statusCode || 500).json({
            EM: error.message || "Lỗi server",
            DT: {}
        });
    }
}

// TODO:
// export const deleteChildAccount = (req, res) => { ... }

