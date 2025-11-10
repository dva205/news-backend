import db from '../models/index.js';
import crypto from "crypto";
import { ApiError } from '../utils/ApiError.js';


export const createChildAccount = async (parentId, childData) => {
    const { username, firstName, lastName, dob, gender } = childData;

    // 1. Kiểm tra username tồn tại
    const existChild = await db.User.findOne({ where: { username } });
    if (existChild) {
        throw new ApiError("Username đã tồn tại", 400);
    }

    // 2. Dùng transaction để tạo User và Invite
    const t = await db.sequelize.transaction();
    try {
        // 3. Tạo User con
        const newChild = await db.User.create({
            username,
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            dob,
            gender,
            role: "CHILD",
            parent_id: parentId
        }, { transaction: t });

        // 4. Tạo code mời
        const code = crypto.randomBytes(16).toString('hex');
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 ngày

        // 5. Lưu code vào DB
        const newInvite = await db.Invite.create({
            code,
            parent_id: parentId,
            child_id: newChild.id,
            used: false,
            expires_at
        }, { transaction: t });

        // 6. Nếu mọi thứ thành công, commit transaction
        await t.commit();

        // 7. Trả về dữ liệu
        return {
            newChild,
            newInvite
            // Controller sẽ lo việc tạo `inviteUrl`
        };

    } catch (error) {
        await t.rollback();
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Lỗi khi tạo tài khoản: ${error.message}`, 500);
    }
}


export const getAllChildren = async (parentId) => {
    const children = await db.User.findAll({
        where: {
            parent_id: parentId,
            role: 'CHILD'
        },
        attributes: { exclude: ['password_hashed'] }
    });

    if (!children || children.length === 0) {
        throw new ApiError("Bạn chưa tạo tài khoản con nào", 404);
    }

    return { children };
}


export const updateChild = async (parentId, childId, updateData) => {
    const { firstName, lastName, dob, gender } = updateData;

    // 1. Tìm đúng tài khoản con của đúng phụ huynh này
    const child = await db.User.findOne({
        where: {
            id: childId,
            parent_id: parentId,
            role: 'CHILD'
        }
    });

    if (!child) {
        throw new ApiError("Không tìm thấy tài khoản con hoặc bạn không có quyền sửa", 404);
    }

    // 2. Cập nhật thông tin
    await child.update({
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        dob,
        gender
    });

    // 3. Trả về thông tin đã cập nhật
    return { child };
}