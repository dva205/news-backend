import db from "../models/index.js";

export const logTime = async (childId, activeSecond) => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().split('T')[0];
    const todayStr = localISOTime;

    const timeLimitSetting = await db.Strict.findOne({
        where: {
            child_id: childId
        },
        attributes: ['time_limit_minutes'],
    });

    const limitMinutes = timeLimitSetting ? timeLimitSetting.time_limit_minutes : null;


    const [timeLog, created] = await db.UsageLog.findOrCreate({
        where: {
            child_id: childId,
            session_date: todayStr
        },
        defaults: {
            active_seconds: 0
        }
    });

    await timeLog.increment('active_seconds', { by: activeSecond });
    await timeLog.reload();

    const currentTotalMinutes = Math.floor(timeLog.active_seconds / 60);

    let remainingMinutes = null;

    if (limitMinutes && limitMinutes > 0) {
        remainingMinutes = limitMinutes - currentTotalMinutes;
    }


    // giới hạn thời gian là 123 - thời gian đã dùng
    return {
        date: todayStr,
        addedSeconds: activeSecond,
        totalSecondsToday: timeLog.active_seconds,
        totalMinutesToday: Math.floor(timeLog.active_seconds / 60),
        dailyLimitMinutes: limitMinutes,
        remainingMinutes: remainingMinutes
    };
};
