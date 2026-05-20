const userService = require('../services/userService');

/**
 * POST /api/users/register
 * Body: { email, bioPageSlug }
 */
async function register(req, res, next) {
  try {
    const { email, bioPageSlug } = req.body;

    if (!email || !bioPageSlug) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Thiếu thông tin bắt buộc: email, bioPageSlug'
      });
    }

    // Validate slug format: chỉ cho phép a-z, 0-9, dấu gạch ngang
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!slugRegex.test(bioPageSlug)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang (ví dụ: linh-beauty).'
      });
    }

    const user = await userService.registerUser({ email, bioPageSlug });

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        bioPageSlug: user.bioPageSlug
      },
      message: 'Đăng ký thành công!'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register };
