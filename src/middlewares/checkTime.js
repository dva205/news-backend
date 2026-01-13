import db from '../models/index.js';

export const checkTime = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Tìm giới hạn thời gian của trẻ
    const strictSettings = await db.Strict.findOne({
      where: {
        child_id: user.id,
      },
    });

    // Nếu không có setting hoặc không set time_limit_minutes thì cho qua
    if (
      !strictSettings ||
      strictSettings.time_limit_minutes === null ||
      strictSettings.time_limit_minutes === 0
    ) {
      return next();
    }

    const timeLimit = strictSettings.time_limit_minutes * 60;

    // 2. Tìm thời gian đã sử dụng hôm nay
    const today = new Date().toISOString().split('T')[0];
    const usageLog = await db.UsageLog.findOne({
      where: {
        child_id: user.id,
        session_date: today,
      },
    });

    const timeUsed = usageLog ? usageLog.active_seconds : 0;

    // 3. So sánh
    if (timeUsed >= timeLimit) {
      return res.status(403).json({
        EM: 'Bạn đã dùng hết thời gian cho phép hôm nay. Hãy quay lại vào ngày mai nhé!',
        DT: {
          timeLimit,
          timeUsed,
        },
      });
    }

    next();
  } catch (error) {
    console.log('Lỗi khi check time:', error);
    return res.status(500).json({
      EM: 'Lỗi server khi kiểm tra thời gian sử dụng',
      DT: {},
    });
  }
};
