const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateRandomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function generateShortLink({ userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User with ID ${userId} not found`);

  let product = await prisma.product.findFirst({ where: { originalUrl } });
  if (!product) {
    product = await prisma.product.create({
      data: { platform, originalUrl, name, imageUrl, currentPrice: currentPrice ? parseFloat(currentPrice) : null },
    });
  }

  let shortCode,
    isUnique = false,
    attempts = 0;
  while (!isUnique && attempts < 10) {
    shortCode = generateRandomCode(5);
    const existing = await prisma.shortLink.findUnique({ where: { shortCode } });
    if (!existing) isUnique = true;
    attempts++;
  }
  if (!isUnique) throw new Error("Could not generate a unique shortCode");

  // sortOrder = current max + 1
  const maxOrder = await prisma.shortLink.aggregate({ where: { userId }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const shortLink = await prisma.shortLink.create({
    data: { userId, productId: product.id, shortCode, affiliateDeepLink, isActiveOnBio: true, sortOrder: nextOrder },
    include: { User: true, Product: true },
  });
  return shortLink;
}

async function getBioLinksBySlug(slug) {
  const user = await prisma.user.findUnique({ where: { bioPageSlug: slug } });
  if (!user) return null;

  const links = await prisma.shortLink.findMany({
    where: { userId: user.id, isActiveOnBio: true },
    include: { Product: true },
    orderBy: { sortOrder: "asc" },
  });
  return { user, links };
}

async function getAllLinksBySlug(slug) {
  const user = await prisma.user.findUnique({ where: { bioPageSlug: slug } });
  if (!user) return null;

  const links = await prisma.shortLink.findMany({
    where: { userId: user.id },
    include: { Product: true, ClickTrackings: { select: { id: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return { user, links };
}

async function getShortLinkByCode(shortCode) {
  return await prisma.shortLink.findUnique({ where: { shortCode }, include: { Product: true } });
}

async function recordClick(shortLinkId, deviceOS, referrer) {
  return await prisma.clickTracking.create({ data: { shortLinkId, deviceOS, referrer: referrer || null } });
}

async function deleteLink(linkId, userId) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error("Link không tồn tại."), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error("Không có quyền thực hiện."), { status: 403 });

  await prisma.$transaction([
    prisma.clickTracking.deleteMany({ where: { shortLinkId: linkId } }),
    prisma.shortLink.delete({ where: { id: linkId } }),
  ]);
}

async function toggleLink(linkId, userId) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error("Link không tồn tại."), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error("Không có quyền thực hiện."), { status: 403 });
  return await prisma.shortLink.update({
    where: { id: linkId },
    data: { isActiveOnBio: !link.isActiveOnBio },
    include: { Product: true },
  });
}

async function editLink(linkId, userId, { name, imageUrl, currentPrice, affiliateDeepLink }) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error("Link không tồn tại."), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error("Không có quyền thực hiện."), { status: 403 });

  // Cập nhật Product
  await prisma.product.update({
    where: { id: link.productId },
    data: {
      name: name ?? undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      currentPrice: currentPrice !== undefined ? (currentPrice ? parseFloat(currentPrice) : null) : undefined,
    },
  });

  // Cập nhật ShortLink
  return await prisma.shortLink.update({
    where: { id: linkId },
    data: { affiliateDeepLink: affiliateDeepLink ?? undefined },
    include: { Product: true },
  });
}

async function reorderLinks(userId, orderedIds) {
  // orderedIds: string[] theo thứ tự mới
  const updates = orderedIds.map((id, index) =>
    prisma.shortLink.updateMany({ where: { id, userId }, data: { sortOrder: index } }),
  );
  await Promise.all(updates);
}

async function getLinkStats(userId) {
  const links = await prisma.shortLink.findMany({
    where: { userId },
    include: { _count: { select: { ClickTrackings: true } }, Product: { select: { name: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return links.map((l) => ({
    id: l.id,
    shortCode: l.shortCode,
    name: l.Product.name,
    clicks: l._count.ClickTrackings,
  }));
}

module.exports = {
  generateShortLink,
  getBioLinksBySlug,
  getAllLinksBySlug,
  getShortLinkByCode,
  recordClick,
  deleteLink,
  toggleLink,
  editLink,
  reorderLinks,
  getLinkStats,
};
