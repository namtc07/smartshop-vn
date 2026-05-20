const userService = require('../services/userService');

/**
 * POST /api/users/register
 * Body: { email, password, bioPageSlug }
 */
async function register(req, res, next) {
  try {
    const { email, password, bioPageSlug } = req.body;

    if (!email || !password || !bioPageSlug) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Thiếu thông tin bắt buộc: email, password, bioPageSlug'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Mật khẩu phải có ít nhất 6 ký tự.'
      });
    }

    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugRegex.test(bioPageSlug)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang.'
      });
    }

    const user = await userService.registerUser({ email, password, bioPageSlug });

    return res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email, bioPageSlug: user.bioPageSlug },
      message: 'Đăng ký thành công!'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Thiếu thông tin bắt buộc: email, password'
      });
    }

    const user = await userService.loginUser({ email, password });

    return res.json({
      success: true,
      data: { id: user.id, email: user.email, bioPageSlug: user.bioPageSlug },
      message: 'Đăng nhập thành công!'
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { userId } = req.params;
    const { displayName, bio, avatarUrl } = req.body;
    const user = await userService.updateProfile(userId, { displayName, bio, avatarUrl });
    return res.json({ success: true, data: user, message: 'Đã cập nhật profile.' });
  } catch (error) { next(error); }
}

module.exports = { register, login, updateProfile };
