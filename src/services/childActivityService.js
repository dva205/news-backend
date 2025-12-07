import db from "../models/index.js";

export const logTime = async (childId, activeSecond) => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().split('T')[0];
    const todayStr = localISOTime;

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


    return {
        date: todayStr,
        addedSeconds: activeSecond,
        totalSecondsToday: timeLog.active_seconds,
        totalMinutesToday: Math.floor(timeLog.active_seconds / 60)
    };
};
