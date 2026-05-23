const linkService = require('../services/linkService');
const useragent = require('useragent');

async function generate(req, res, next) {
  try {
    const { userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate } = req.body;
    if (!userId || !platform || !originalUrl || !name || !affiliateDeepLink) {
      return res.status(400).json({ success: false, data: null, message: 'Missing required fields' });
    }
    const shortLink = await linkService.generateShortLink({ userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate });
    return res.status(201).json({ success: true, data: shortLink, message: 'Short link generated successfully' });
  } catch (error) { next(error); }
}

async function getBioLinks(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await linkService.getBioLinksBySlug(slug);
    if (!result) return res.status(404).json({ success: false, data: null, message: 'Bio page not found' });
    const { password: _, ...safeUser } = result.user;
    return res.json({ success: true, data: { user: safeUser, links: result.links }, message: 'OK' });
  } catch (error) { next(error); }
}

async function getDashboardLinks(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await linkService.getAllLinksBySlug(slug);
    if (!result) return res.status(404).json({ success: false, data: null, message: 'User not found' });

    const { password: _, ...safeUser } = result.user;
    return res.json({
      success: true,
      data: {
        user: safeUser,
        links: result.links.map(l => ({ ...l, clicks: l.ClickTrackings.length, ClickTrackings: undefined })),
        categories: result.categories,
      },
      message: 'OK',
    });
  } catch (error) { next(error); }
}

async function deleteLink(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    await linkService.deleteLink(id, userId);
    return res.json({ success: true, message: 'Đã xoá sản phẩm.' });
  } catch (error) { next(error); }
}

async function toggleLink(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const updated = await linkService.toggleLink(id, userId);
    return res.json({ success: true, data: updated, message: 'Đã cập nhật trạng thái.' });
  } catch (error) { next(error); }
}

async function editLink(req, res, next) {
  try {
    const { id } = req.params;
    const { userId, name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const updated = await linkService.editLink(id, userId, { name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate });
    return res.json({ success: true, data: updated, message: 'Đã cập nhật sản phẩm.' });
  } catch (error) { next(error); }
}

async function reorderLinks(req, res, next) {
  try {
    const { userId, orderedIds } = req.body;
    if (!userId || !Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'userId và orderedIds required' });
    await linkService.reorderLinks(userId, orderedIds);
    return res.json({ success: true, message: 'Đã cập nhật thứ tự.' });
  } catch (error) { next(error); }
}

async function getLinkStats(req, res, next) {
  try {
    const { userId } = req.params;
    const stats = await linkService.getLinkStats(userId);
    return res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

async function getAnalytics(req, res, next) {
  try {
    const { slug } = req.params;
    const { period } = req.query;
    const data = await linkService.getAnalytics(slug, period || '7d');
    if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function redirectShortLink(req, res, next) {
  try {
    const { shortCode } = req.params;
    const shortLink = await linkService.getShortLinkByCode(shortCode);
    if (!shortLink) return res.status(404).send('Not found');
    const uaString = req.headers['user-agent'] || '';
    const agent = useragent.parse(uaString);
    const deviceOS = agent.os.family !== 'Other' ? agent.os.family : 'Unknown OS';
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;
    linkService.recordClick(shortLink.id, deviceOS, referrer).catch(console.error);
    return res.redirect(302, shortLink.affiliateDeepLink);
  } catch (error) { next(error); }
}

// ── Categories
async function getCategories(req, res, next) {
  try {
    const { userId } = req.params;
    const categories = await linkService.getCategories(userId);
    return res.json({ success: true, data: categories });
  } catch (error) { next(error); }
}

async function createCategory(req, res, next) {
  try {
    const { userId, name } = req.body;
    if (!userId || !name) return res.status(400).json({ success: false, message: 'userId và name required' });
    const category = await linkService.createCategory(userId, name);
    return res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { userId, name, sortOrder } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const updated = await linkService.updateCategory(id, userId, { name, sortOrder });
    return res.json({ success: true, data: updated });
  } catch (error) { next(error); }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    await linkService.deleteCategory(id, userId);
    return res.json({ success: true, message: 'Đã xoá danh mục.' });
  } catch (error) { next(error); }
}

module.exports = {
  generate,
  getBioLinks,
  getDashboardLinks,
  deleteLink,
  toggleLink,
  editLink,
  updateProductInline,
  bulkAction,
  reorderLinks,
  getLinkStats,
  getAnalytics,
  redirectShortLink,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductProfitability,
  getRevenueEntries,
  upsertRevenueEntry,
  deleteRevenueEntry,
};

// ── Inline product edit (name / currentPrice)
async function updateProductInline(req, res, next) {
  try {
    const { id } = req.params;
    const { userId, name, currentPrice } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    if (name === undefined && currentPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Cần ít nhất 1 trường để cập nhật (name hoặc currentPrice).' });
    }
    const updated = await linkService.updateProductInline(id, userId, { name, currentPrice });
    return res.json({ success: true, data: updated, message: 'Đã cập nhật.' });
  } catch (error) { next(error); }
}

// ── Bulk action: hide / show / feature / unfeature / delete
async function bulkAction(req, res, next) {
  try {
    const { userId, ids, action } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids phải là mảng không rỗng' });
    }
    const allowed = ['hide', 'show', 'feature', 'unfeature', 'delete'];
    if (!allowed.includes(action)) {
      return res.status(400).json({ success: false, message: `action không hợp lệ. Cho phép: ${allowed.join(', ')}` });
    }
    const result = await linkService.bulkLinkAction(userId, ids, action);
    return res.json({ success: true, data: result, message: `Đã ${action} ${result.affected} sản phẩm.` });
  } catch (error) { next(error); }
}

async function getProductProfitability(req, res, next) {
  try {
    const { userId } = req.params;
    const data = await linkService.getProductProfitability(userId);
    return res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function getRevenueEntries(req, res, next) {
  try {
    const { userId } = req.params;
    const entries = await linkService.getRevenueEntries(userId);
    return res.json({ success: true, data: entries });
  } catch (error) { next(error); }
}

async function upsertRevenueEntry(req, res, next) {
  try {
    const { userId, id, month, platform, actualAmount, notes } = req.body;
    if (!userId || !month || !platform || actualAmount == null) {
      return res.status(400).json({ success: false, message: 'userId, month, platform, actualAmount required' });
    }
    const entry = await linkService.upsertRevenueEntry(userId, { id, month, platform, actualAmount, notes });
    return res.json({ success: true, data: entry });
  } catch (error) { next(error); }
}

async function deleteRevenueEntry(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    await linkService.deleteRevenueEntry(id, userId);
    return res.json({ success: true, message: 'Đã xoá.' });
  } catch (error) { next(error); }
}
