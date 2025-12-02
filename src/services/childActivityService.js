import db from "../models/index.js";

export const logTime = async (childId, activeSecond) => {
    const today = new Date().toISOString().split('T')[0];

    let timeLog = await db.UsageLog.findOne({
        where: {
            child_id: childId,
            session_date: today
        }
    });

    if (timeLog) {
        timeLog.active_seconds = timeLog.active_seconds + activeSecond;
        await timeLog.save();
    } else {
        timeLog = await db.UsageLog.create({
            child_id: childId,
            session_date: today,
            active_seconds: activeSecond
        });
    }


    return timeLog;
};
