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

export const updateStreak = async (childId, today, yesterday) => {
    let [streakRecord, created] = await db.Streak.findOrCreate({
        where: { child_id: childId },
        defaults: {
            streak_count: 1,
            max_streak: 1,
            last_activity_date: today
        }
    });

    // nếu lần đầu tạo trả về luôn
    if (created) return streakRecord;

    const lastDate = streakRecord.last_activity_date;

    // 3. So sánh ngày
    if (lastDate === today) {
        // A. Đã đọc hôm nay rồi -> Không làm gì cả
        return streakRecord;
    }
    else if (lastDate === yesterday) {
        // B. Đọc liên tiếp (Hôm qua có đọc) -> Tăng streak
        streakRecord.streak_count += 1;

        // Cập nhật kỷ lục nếu phá kỷ lục cũ
        if (streakRecord.streak_count > streakRecord.max_streak) {
            streakRecord.max_streak = streakRecord.streak_count;
        }
    }
    else {
        // C. Bị ngắt quãng (Lần cuối đọc là hôm kia hoặc lâu hơn) -> Reset về 1
        streakRecord.streak_count = 1;
    }

    // 4. Cập nhật ngày hoạt động mới nhất là hôm nay
    streakRecord.last_activity_date = today;
    await streakRecord.save();

    return streakRecord;
}

export const getStreak = async (childId) => {
    const streakCount = await db.Streak.findOne({
        where: {
            child_id: childId,
        },
        attributes: ['streak_count', 'max_streak']
    })

    return {
        streakCount: streakCount.streak_count,
        maxStreak: streakCount.max_streak
    };
}

