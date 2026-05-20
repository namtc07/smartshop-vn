const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Đăng ký tài khoản KOC mới
 */
async function registerUser({ email, password, bioPageSlug }) {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    const err = new Error('Email này đã được sử dụng.');
    err.status = 409;
    throw err;
  }

  const existingSlug = await prisma.user.findUnique({ where: { bioPageSlug } });
  if (existingSlug) {
    const err = new Error('Slug này đã được sử dụng. Vui lòng chọn slug khác.');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, bioPageSlug }
  });

  return user;
}

/**
 * Đăng nhập bằng email + password
 */
async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.status = 401;
    throw err;
  }

  return user;
}

async function updateProfile(userId, { displayName, bio, avatarUrl }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('User không tồn tại.'), { status: 404 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: displayName !== undefined ? displayName : undefined,
      bio: bio !== undefined ? bio : undefined,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
    }
  });
  const { password: _, ...safe } = updated;
  return safe;
}

module.exports = { registerUser, loginUser, updateProfile };
