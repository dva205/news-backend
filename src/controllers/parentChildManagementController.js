import { createChildAccount, getAllChildren, getTimeLimit, setStrict, updateChild } from '../services/parentChildManagementService.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

export const createAccountWithInviteLink = async (req, res) => {
    try {
        // 1. Lấy dữ liệu 
        const parentId = req.user.id;
        const { username, firstName, lastName, dob, gender } = req.body;

        // 2. Validate 
        if (!username || !firstName || !lastName || !dob || !gender) {
            return sendError(res, {
                statusCode: 400,
                message: "Tất cả các trường không được để trống"
            });
        }

        if (!parentId) {
            return sendError(res, {
                statusCode: 401,
                message: "Người dùng không có quyền thực hiện hành động này"
            });
        }

        // 3. Gọi Service 
        const data = await createChildAccount(parentId, { username, firstName, lastName, dob, gender });

        // 4. Xử lý Response 
        const responseData = {
            id: data.newChild.id,
            username: data.newChild.username,
            role: data.newChild.role,
            display_name: data.newChild.display_name,
            dob: data.newChild.dob,
            gender: data.newChild.gender,
            parent_id: data.newChild.parent_id,
            newInvite: data.newInvite
        };

        return sendSuccess(res, responseData, "Đăng kí cho con thành công", 201);
    } catch (error) {
        console.log("Lỗi khi tạo tài khoản cho con", error);
        return sendError(res, error);
    }
}

export const getAllChild = async (req, res) => {
    try {
        // 1. Lấy dữ liệu
        const parentId = req?.user.id;

        if (!parentId) {
            return sendError(res, {
                statusCode: 401,
                message: "Người dùng không có quyền thực hiện hành động này"
            });
        }

        // 2. Gọi Service
        const data = await getAllChildren(parentId);

        // 3. Trả Response
        return sendSuccess(res, data, `Bạn có ${data.children.length} tài khoản con`, 200);
    } catch (error) {
        console.log("Lỗi khi xem tài khoản con", error);
        return sendError(res, error);
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
            return sendError(res, { statusCode: 400, message: "Thiếu ID của con" });
        }

        if (!parentId) {
            return sendError(res, { statusCode: 401, message: "Người dùng không có quyền thực hiện hành động này" });
        }

        if (!firstName || !lastName) {
            return sendError(res, { statusCode: 400, message: "Họ và tên không được để trống" });
        }

        // 3. Gọi Service
        const data = await updateChild(parentId, childId, {
            firstName, lastName, dob, gender
        });

        // 4. Trả Response
        return sendSuccess(res, data, "Cập nhật tài khoản con thành công", 200);

    } catch (error) {
        console.log("Lỗi khi update tài khoản con", error);
        return sendError(res, error);
    }
}


export const setChildStrict = async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req.user.id;
        const { timeLimit, blockedKeyword, blockedCategory, blockedFeature } = req.body;

        const timeLimitMinute = parseInt(timeLimit);

        if (!childId) {
            return sendError(res, { statusCode: 400, message: "Thiếu ID của con" });
        }

        if (!parentId) {
            return sendError(res, { statusCode: 401, message: "Người dùng không có quyền thực hiện hành động này" });
        }

        const data = await setStrict(childId, parentId, timeLimitMinute, blockedKeyword, blockedCategory, blockedFeature);

        return sendSuccess(res, data, "Cập nhật các giới hạn cho con thành công", 200);
    } catch (error) {
        console.log("Lỗi khi update các giới hạn cho con", error);
        return sendError(res, error);
    }
}

export const getChildActivity = async (req, res) => {
    try {
        const childId = req.params.id;
        const parentId = req.user.id;
        const { timeRange } = req.body;

        if (!childId) {
            return sendError(res, { statusCode: 400, message: "Thiếu ID của con" });
        }

        if (!parentId) {
            return sendError(res, { statusCode: 401, message: "Người dùng không có quyền thực hiện hành động này" });
        }

        const data = await getTimeLimit(childId, parentId, timeRange);

        return sendSuccess(res, data, "Xem hoạt động của con thành công", 200);
    } catch (error) {
        console.log("Lỗi khi update các giới hạn cho con", error);
        return sendError(res, error);
    }
}

// TODO:
// export const deleteChildAccount = (req, res) => { ... }

