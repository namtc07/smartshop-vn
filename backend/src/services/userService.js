const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Đăng ký tài khoản KOC mới
 */
async function registerUser({ email, bioPageSlug }) {
  // Kiểm tra email đã tồn tại chưa
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const err = new Error('Email này đã được sử dụng.');
    err.status = 409;
    throw err;
  }

  // Kiểm tra slug đã tồn tại chưa
  const existingSlug = await prisma.user.findUnique({ where: { bioPageSlug } });
  if (existingSlug) {
    const err = new Error('Slug này đã được sử dụng. Vui lòng chọn slug khác.');
    err.status = 409;
    throw err;
  }

  // Tạo user mới
  const user = await prisma.user.create({
    data: { email, bioPageSlug }
  });

  return user;
}

module.exports = { registerUser };
