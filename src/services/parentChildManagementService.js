import db from '../models/index.js';
import crypto from "crypto";
import { ApiError } from '../utils/ApiError.js';
import { Op } from 'sequelize'
import { formatChildResponse } from '../helpers/formatChildResponse.js';


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
            newChild: formatChildResponse(newChild, newInvite),
            newInvite: newInvite
        };
    } catch (error) {
        await t.rollback();
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Lỗi khi tạo tài khoản cho con: ${error.message}`, 500);
    }
}


export const getAllChildren = async (parentId) => {
    const children = await db.User.findAll({
        where: {
            parent_id: parentId,
            role: 'CHILD'
        },
        attributes: { exclude: ['password_hashed'] },
        include: [
            {
                model: db.Invite,
                as: 'receivedInvites',
                attributes: ['code', 'used', 'expires_at'],
                required: false
            },
            {
                model: db.Strict,
                as: 'stricts',
                attributes: ['time_limit_minutes', 'blocked_keyword', 'blocked_category', 'blocked_feature'],
                require: false
            }
        ],
        order: [['created_at', 'DESC']]
    });

    // Format response to include invite code
    const formattedChildren = children.map(child => formatChildResponse(child));

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
        throw new ApiError("Không tìm thấy tài khoản con hoặc bạn không có quyền sửa", 400);
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
    return formatChildResponse(child);
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

    const updateData = {
        time_limit_minutes: timeLimitMinute,
        blocked_keyword: blockedKeyword || [],
        blocked_category: blockedCategory || [],
        blocked_feature: blockedFeature || []
    };

    console.log(updateData)

    // tìm strict để update nếu ko có thì create
    const [strictRecord, created] = await db.Strict.findOrCreate({
        where: {
            child_id: childId
        },
        defaults: updateData
    })


    // nếu ko create thì update
    if (!created) {
        await strictRecord.update(updateData);
    }

    return {
        timeLimit: timeLimitMinute,
        blockedKeywords: blockedKeyword || [],
        blockedCategories: blockedCategory || [],
        blockedFeatures: blockedFeature || []
    };
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
        childId: child.id,
        childName: child.display_name,
        range: timeRange,
        chartData: stats,
        totalMinutes
    };
}
