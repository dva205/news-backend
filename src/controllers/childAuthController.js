import {
  validateInviteCode,
  signInChild,
  signOutChild,
  activeChildAccount,
  refreshToken,
  updateChildProfile,
} from '../services/childAuthService.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';
import { formatStrictRuleResponse } from '../helpers/formatStrictRuleResponse.js';
import { getStrictRules } from '../services/childArticleService.js';
import { handleUploadImage } from '../utils/handleUpload.js';

export const validateInvite = async (req, res) => {
  try {
    const code = req.query?.code;

    if (!code) {
      return sendError(res, {
        statusCode: 400,
        message: 'Thiếu mã mời',
      });
    }

    // 2. Gọi Service
    const data = await validateInviteCode(code);

    // 3. Trả Response
    return sendSuccess(res, data, 'Link hợp lệ', 200);
  } catch (error) {
    console.error('Lỗi khi validate link', error);
    return sendError(res, error);
  }
};

export const activateChildAccount = async (req, res) => {
  try {
    const { code, password } = req.body;

    // 1. Validate
    if (!password || !code) {
      return sendError(res, {
        statusCode: 400,
        message: 'Mã kích hoạt tài khoản và mật khẩu không được để trống',
      });
    }

    // 2. Gọi Service
    await activeChildAccount(code, password);

    // 3. Trả Response
    return sendSuccess(res, null, 'Kích hoạt thành công', 204);
  } catch (error) {
    console.log('Lỗi khi activate child account', error);
    return sendError(res, error);
  }
};

export const childSignIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate
    if (!username || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Tên đăng nhập và mật khẩu không được để trống',
      });
    }

    // 2. Gọi Service
    const data = await signInChild(username, password);

    // 3. Đặt Cookie
    res.cookie('refreshChildToken', data.refreshChildToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: data.REFRESH_TOKEN_TTL,
    });

    return sendSuccess(
      res,
      { accessToken: data.accessToken },
      'Đăng nhập thành công',
      200
    );
  } catch (error) {
    console.log('Lỗi khi child đăng nhập', error);
    return sendError(res, error);
  }
};

export const childSignOut = async (req, res) => {
  try {
    // 1. Lấy token
    const refreshChildToken = req.cookies?.refreshChildToken;

    if (refreshChildToken) {
      // 2. Gọi Service
      await signOutChild(refreshChildToken);
    }

    // 3. Xóa Cookie
    res.clearCookie('refreshChildToken', {
      httpOnly: true,
      // secure: true,
      sameSite: 'lax',
    });

    // 4. Trả Response
    return sendSuccess(res, null, 'Đăng xuất thành công', 200);
  } catch (error) {
    console.error('Lỗi khi child sign out', error);
    return sendError(res, error);
  }
};

export const refreshChildToken = async (req, res) => {
  try {
    // 1. Lấy token
    const refreshChildToken = req.cookies?.refreshChildToken;

    if (!refreshChildToken) {
      return sendError(res, {
        statusCode: 401,
        message: 'Thiếu refresh token',
      });
    }

    // 2. Gọi Service
    const data = await refreshToken(refreshChildToken);

    // 3. Trả Response
    return sendSuccess(res, data, 'Làm mới token thành công', 200);
  } catch (error) {
    console.log('Lỗi khi gọi refreshChildToken', error);
    return sendError(res, error);
  }
};

// lấy strict rule
export const getMyStrictRules = async (req, res) => {
  try {
    const childId = req.user.id;
    if (!childId) {
      return sendError(res, {
        statusCode: 401,
        message: 'Nguời dùng không có quyền thực hiện hành động này',
      });
    }

    const rules = await getStrictRules(childId);

    return sendSuccess(
      res,
      formatStrictRuleResponse(rules),
      'Lấy strict rules thành công',
      200
    );
  } catch (error) {
    console.error('Lỗi khi lấy strict rules:', error);
    return sendError(res, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const childId = req.user.id;

    // Validate: Check nếu có lỗi từ fileFilter
    if (req.fileValidationError) {
      return sendError(res, {
        statusCode: 400,
        message: req.fileValidationError,
      });
    }

    if (!childId) {
      return sendError(res, {
        statusCode: 401,
        message: 'Người dùng không có quyền thực hiện hành động này',
      });
    }

    let avatarUrl = null;
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        const cldRes = await handleUploadImage(dataURI);

        avatarUrl = cldRes.secure_url;
      } catch (error) {
        console.error('Lỗi khi upload ảnh lên cdn', error);
        return sendError(res, {
          statusCode: 500,
          message: 'Lỗi hệ thống',
        });
      }
    }

    const data = await updateChildProfile(childId, avatarUrl);

    return sendSuccess(res, data, 'Cập nhật thông tin thành công', 200);
  } catch (error) {
    console.error('Lỗi gọi update child profile:', error);
    return sendError(res, error);
  }
};
