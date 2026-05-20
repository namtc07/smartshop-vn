const linkService = require('../services/linkService');
const useragent = require('useragent');

/**
 * API: POST /api/links/generate
 */
async function generate(req, res, next) {
  try {
    const {
      userId,
      platform,
      originalUrl,
      name,
      imageUrl,
      currentPrice,
      affiliateDeepLink
    } = req.body;

    // Validate request body
    if (!userId || !platform || !originalUrl || !name || !affiliateDeepLink) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Missing required fields: userId, platform, originalUrl, name, affiliateDeepLink'
      });
    }

    const shortLink = await linkService.generateShortLink({
      userId,
      platform,
      originalUrl,
      name,
      imageUrl,
      currentPrice,
      affiliateDeepLink
    });

    return res.status(201).json({
      success: true,
      data: shortLink,
      message: 'Short link generated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * API: GET /api/b/:slug
 */
async function getBioLinks(req, res, next) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Bio page slug is required'
      });
    }

    const result = await linkService.getBioLinksBySlug(slug);

    if (!result) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User bio page not found'
      });
    }

    // Trả về danh sách ShortLink kèm theo Product
    return res.json({
      success: true,
      data: result.links,
      message: 'Bio links retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * API: GET /:shortCode
 * Xử lý Tracking và Redirect 302
 */
async function redirectShortLink(req, res, next) {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).send('Short code is required');
    }

    // Tìm short link
    const shortLink = await linkService.getShortLinkByCode(shortCode);

    if (!shortLink) {
      return res.status(404).send('Short link not found');
    }

    // Lấy thông tin Device OS từ User-Agent
    const uaString = req.headers['user-agent'] || '';
    const agent = useragent.parse(uaString);
    const deviceOS = agent.os.family !== 'Other' ? agent.os.family : 'Unknown OS';

    // Lấy thông tin Referrer
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;

    // Lưu Click Tracking không đồng bộ để tránh block client redirect
    linkService.recordClick(shortLink.id, deviceOS, referrer)
      .catch(err => console.error('Error tracking click:', err));

    // Redirect 302 về affiliate deep link
    return res.redirect(302, shortLink.affiliateDeepLink);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generate,
  getBioLinks,
  redirectShortLink
};
