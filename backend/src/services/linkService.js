const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Hàm tạo mã ngẫu nhiên 5 ký tự (A-Za-z0-9)
function generateRandomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Tạo/Tìm Product và sinh ShortLink cho User
 */
async function generateShortLink({
  userId,
  platform,
  originalUrl,
  name,
  imageUrl,
  currentPrice,
  affiliateDeepLink
}) {
  // 1. Kiểm tra xem User có tồn tại không
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // 2. Tìm hoặc tạo Product dựa vào originalUrl
  let product = await prisma.product.findFirst({
    where: { originalUrl }
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        platform,
        originalUrl,
        name,
        imageUrl,
        currentPrice: currentPrice ? parseFloat(currentPrice) : null
      }
    });
  }

  // 3. Sinh shortCode không trùng lặp
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    shortCode = generateRandomCode(5);
    const existing = await prisma.shortLink.findUnique({
      where: { shortCode }
    });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Could not generate a unique shortCode');
  }

  // 4. Tạo ShortLink
  const shortLink = await prisma.shortLink.create({
    data: {
      userId,
      productId: product.id,
      shortCode,
      affiliateDeepLink,
      isActiveOnBio: true
    },
    include: {
      User: true,
      Product: true
    }
  });

  return shortLink;
}

/**
 * Lấy danh sách link hoạt động trên Bio Page của User theo slug
 */
async function getBioLinksBySlug(slug) {
  // Tìm user theo slug
  const user = await prisma.user.findUnique({
    where: { bioPageSlug: slug }
  });

  if (!user) {
    return null;
  }

  // Lấy các short link đang active của user kèm thông tin Product
  const links = await prisma.shortLink.findMany({
    where: {
      userId: user.id,
      isActiveOnBio: true
    },
    include: {
      Product: true
    }
  });

  return {
    user,
    links
  };
}

/**
 * Tìm ShortLink theo shortCode
 */
async function getShortLinkByCode(shortCode) {
  return await prisma.shortLink.findUnique({
    where: { shortCode },
    include: {
      Product: true
    }
  });
}

/**
 * Ghi nhận Click Tracking
 */
async function recordClick(shortLinkId, deviceOS, referrer) {
  return await prisma.clickTracking.create({
    data: {
      shortLinkId,
      deviceOS,
      referrer: referrer || null
    }
  });
}

module.exports = {
  generateShortLink,
  getBioLinksBySlug,
  getShortLinkByCode,
  recordClick
};
