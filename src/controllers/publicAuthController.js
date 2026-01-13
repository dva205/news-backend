import { sendError, sendSuccess } from '../utils/ApiResponse.js';
import db from '../models/index.js';

export const validateSession = async (req, res) => {
  try {
    // Chỉ cần check xem có refreshToken trong cookie hay không
    const token =
      req.cookies?.refreshChildToken || req.cookies?.refreshParentToken;

    if (!token) {
      return sendSuccess(
        res,
        { hasSession: false, role: null },
        'Không có phiên làm việc',
        200
      );
    }

    const session = await db.Session.findOne({
      where: {
        refresh_token: token,
      },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['role'],
        },
      ],
    });

    if (!session) {
      // Có cookie nhưng không khớp DB
      return sendSuccess(
        res,
        { hasSession: false, role: null },
        'Phiên làm việc không tồn tại trong hệ thống',
        200
      );
    }

    // Có cookie = có session
    return sendSuccess(
      res,
      { hasSession: true, role: session.user.role },
      'Phiên làm việc hợp lệ',
      200
    );
  } catch (error) {
    console.log('Lỗi khi validate session', error);
    return sendError(res, error);
  }
};

export const forceUserLogOut = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      // secure: true
    };

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('refreshChildToken', cookieOptions);
    res.clearCookie('refreshParentToken', cookieOptions);

    return sendSuccess(res, null, 'Xóa phiên làm việc cũ thành công', 200);
  } catch (error) {
    console.log('Lỗi khi force user log out', error);
    return sendError(res, error);
  }
};
