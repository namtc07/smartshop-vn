const linkService = require('../services/linkService');
const useragent = require('useragent');

async function generate(req, res, next) {
  try {
    const { userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink } = req.body;
    if (!userId || !platform || !originalUrl || !name || !affiliateDeepLink) {
      return res.status(400).json({ success: false, data: null, message: 'Missing required fields' });
    }
    const shortLink = await linkService.generateShortLink({ userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink });
    return res.status(201).json({ success: true, data: shortLink, message: 'Short link generated successfully' });
  } catch (error) { next(error); }
}

async function getBioLinks(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await linkService.getBioLinksBySlug(slug);
    if (!result) return res.status(404).json({ success: false, data: null, message: 'Bio page not found' });
    return res.json({ success: true, data: result.links, message: 'OK' });
  } catch (error) { next(error); }
}

async function getDashboardLinks(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await linkService.getAllLinksBySlug(slug);
    if (!result) return res.status(404).json({ success: false, data: null, message: 'User not found' });

    // Strip password, include profile
    const { password: _, ...safeUser } = result.user;
    return res.json({
      success: true,
      data: {
        user: safeUser,
        links: result.links.map(l => ({ ...l, clicks: l.ClickTrackings.length, ClickTrackings: undefined }))
      },
      message: 'OK'
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
    const { userId, name, imageUrl, currentPrice, affiliateDeepLink } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const updated = await linkService.editLink(id, userId, { name, imageUrl, currentPrice, affiliateDeepLink });
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

module.exports = { generate, getBioLinks, getDashboardLinks, deleteLink, toggleLink, editLink, reorderLinks, getLinkStats, redirectShortLink };
