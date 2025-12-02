import db from '../models/index.js';
import crypto from "crypto";
import { ApiError } from '../utils/ApiError.js';
import { Op } from 'sequelize'


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
        attributes: { exclude: ['password_hashed'] },
        include: [{
            model: db.Invite,
            as: 'receivedInvites',
            attributes: ['code', 'used', 'expires_at'],
            required: false
        }]
    });

    if (!children || children.length === 0) {
        throw new ApiError("Bạn chưa tạo tài khoản con nào", 404);
    }

    // Format response to include invite code
    const formattedChildren = children.map(child => {
        const childData = child.toJSON();
        const invite = childData.receivedInvites?.[0]; // Get first invite

        return {
            ...childData,
            inviteCode: invite?.code || null,
            inviteUsed: invite?.used || false,
            inviteExpired: invite?.expires_at ? new Date(invite.expires_at) < new Date() : false,
            receivedInvites: undefined
        };
    });

    return { children: formattedChildren };
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

export const setStrict = async (childId, parentId, timeLimitMinute, blockedKeyword, blockedCategory, blockedFeature) => {
    // tìm con
    const child = await db.User.findOne({
        where: {
            id: childId,
            parent_id: parentId
        }
    })

    if (!child) {
        throw new ApiError("Không tìm thấy tài khoản con hoặc bạn không có quyền sửa", 403)
    }

    // tìm strict để update nếu ko có thì create
    let [strictRecord, created] = await db.Strict.findOrCreate({
        where: {
            child_id: childId
        },
        defaults: {
            time_limit_minutes: timeLimitMinute,
            blocked_keyword: blockedKeyword,
            blocked_category: blockedCategory,
            blocked_feature: blockedFeature
        }
    })


    // nếu ko create thì update
    if (!created) {
        strictRecord = await strictRecord.update({
            time_limit_minutes: timeLimitMinute,
            blocked_keyword: blockedKeyword,
            blocked_category: blockedCategory,
            blocked_feature: blockedFeature
        })
    }

    return strictRecord;
}

export const getTimeLimit = async (childId, parentId, timeRange) => {
    const child = await db.User.findOne({
        where: {
            id: childId,
            parent_id: parentId
        }
    })

    if (!child) {
        throw new ApiError("Không tìm thấy tài khoản con hoặc bạn không có quyền sửa", 403)
    }

    // date range for chart
    let startDate, endDate;
    const today = new Date();

    if (timeRange === 'today') {
        startDate = endDate = today.toISOString().split('T')[0];
    }

    else if (timeRange === 'week') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        startDate = startDate.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    }

    else if (timeRange === 'month') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDate = startDate.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
    }

    else {
        throw new ApiError("Thời gian không hợp lệ", 404)
    }

    // Query và tính tổng theo ngày
    const dailyStats = await db.UsageLog.findAll({
        where: {
            child_id: childId,
            session_date: {
                [Op.between]: [startDate, endDate] // tìm tất cả giữa start và end date
            }
        },
        attributes: [
            'session_date',
            [db.sequelize.fn('SUM', db.sequelize.col('active_seconds')), 'total_seconds']
        ],
        group: ['session_date'],
        order: [['session_date', 'ASC']],
        raw: true
    });

    // format 
    const stats = dailyStats.map(day => ({
        date: day.session_date,
        minutes: Math.floor(day.total_seconds / 60),
        hours: (day.total_seconds / 3600).toFixed(2)
    }));

    const totalMinutes = dailyStats.reduce((sum, day) => sum + Math.floor(day.total_seconds / 60), 0)

    // success
    return {
        child: {
            id: child.id,
            display_name: child.display_name
        },
        timeRange,
        dailyStats: stats,
        totalMinutes
    };
}
