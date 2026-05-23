const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateRandomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function generateShortLink({ userId, platform, originalUrl, name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User with ID ${userId} not found`);

  let product = await prisma.product.findFirst({ where: { originalUrl } });
  if (!product) {
    product = await prisma.product.create({
      data: { platform, originalUrl, name, imageUrl, currentPrice: currentPrice ? parseFloat(currentPrice) : null },
    });
  }

  let shortCode, isUnique = false, attempts = 0;
  while (!isUnique && attempts < 10) {
    shortCode = generateRandomCode(5);
    const existing = await prisma.shortLink.findUnique({ where: { shortCode } });
    if (!existing) isUnique = true;
    attempts++;
  }
  if (!isUnique) throw new Error('Could not generate a unique shortCode');

  const maxOrder = await prisma.shortLink.aggregate({ where: { userId }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const shortLink = await prisma.shortLink.create({
    data: {
      userId,
      productId: product.id,
      shortCode,
      affiliateDeepLink,
      isActiveOnBio: true,
      sortOrder: nextOrder,
      isFeatured: isFeatured ?? false,
      badgeText: badgeText || null,
      videoUrl: videoUrl || null,
      categoryId: categoryId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      customShortCode: customShortCode?.trim() || null,
      commissionRate: commissionRate != null ? parseFloat(commissionRate) : null,
      conversionRate: conversionRate != null ? parseFloat(conversionRate) : null,
    },
    include: { User: true, Product: true, Category: true },
  });
  return shortLink;
}

async function getBioLinksBySlug(slug) {
  const user = await prisma.user.findUnique({ where: { bioPageSlug: slug } });
  if (!user) return null;

  const now = new Date();
  const links = await prisma.shortLink.findMany({
    where: {
      userId: user.id,
      isActiveOnBio: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    include: { Product: true, Category: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  });
  return { user, links };
}

async function getAllLinksBySlug(slug) {
  const user = await prisma.user.findUnique({ where: { bioPageSlug: slug } });
  if (!user) return null;

  const [links, categories] = await Promise.all([
    prisma.shortLink.findMany({
      where: { userId: user.id },
      include: { Product: true, Category: true, ClickTrackings: { select: { id: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { sortOrder: 'asc' } }),
  ]);
  return { user, links, categories };
}

async function getShortLinkByCode(code) {
  const byCustom = await prisma.shortLink.findFirst({ where: { customShortCode: code }, include: { Product: true } });
  if (byCustom) return byCustom;
  return await prisma.shortLink.findUnique({ where: { shortCode: code }, include: { Product: true } });
}

async function recordClick(shortLinkId, deviceOS, referrer) {
  return await prisma.clickTracking.create({ data: { shortLinkId, deviceOS, referrer: referrer || null } });
}

async function deleteLink(linkId, userId) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error('Link không tồn tại.'), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error('Không có quyền thực hiện.'), { status: 403 });

  await prisma.$transaction([
    prisma.clickTracking.deleteMany({ where: { shortLinkId: linkId } }),
    prisma.shortLink.delete({ where: { id: linkId } }),
  ]);
}

async function toggleLink(linkId, userId) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error('Link không tồn tại.'), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error('Không có quyền thực hiện.'), { status: 403 });
  return await prisma.shortLink.update({
    where: { id: linkId },
    data: { isActiveOnBio: !link.isActiveOnBio },
    include: { Product: true, Category: true },
  });
}

async function editLink(linkId, userId, { name, imageUrl, currentPrice, affiliateDeepLink, isFeatured, badgeText, videoUrl, categoryId, startDate, endDate, customShortCode, commissionRate, conversionRate }) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error('Link không tồn tại.'), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error('Không có quyền thực hiện.'), { status: 403 });

  await prisma.product.update({
    where: { id: link.productId },
    data: {
      name: name ?? undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      currentPrice: currentPrice !== undefined ? (currentPrice ? parseFloat(currentPrice) : null) : undefined,
    },
  });

  return await prisma.shortLink.update({
    where: { id: linkId },
    data: {
      affiliateDeepLink: affiliateDeepLink ?? undefined,
      isFeatured: isFeatured ?? undefined,
      badgeText: badgeText !== undefined ? (badgeText || null) : undefined,
      videoUrl: videoUrl !== undefined ? (videoUrl || null) : undefined,
      categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
      startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
      endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      customShortCode: customShortCode !== undefined ? (customShortCode?.trim() || null) : undefined,
      commissionRate: commissionRate !== undefined ? (commissionRate != null ? parseFloat(commissionRate) : null) : undefined,
      conversionRate: conversionRate !== undefined ? (conversionRate != null ? parseFloat(conversionRate) : null) : undefined,
    },
    include: { Product: true, Category: true },
  });
}

async function reorderLinks(userId, orderedIds) {
  const updates = orderedIds.map((id, index) =>
    prisma.shortLink.updateMany({ where: { id, userId }, data: { sortOrder: index } }),
  );
  await Promise.all(updates);
}

async function getLinkStats(userId) {
  const links = await prisma.shortLink.findMany({
    where: { userId },
    include: { _count: { select: { ClickTrackings: true } }, Product: { select: { name: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  return links.map((l) => ({
    id: l.id,
    shortCode: l.shortCode,
    name: l.Product.name,
    clicks: l._count.ClickTrackings,
  }));
}

async function getAnalytics(slug, period = '7d') {
  const user = await prisma.user.findUnique({ where: { bioPageSlug: slug } });
  if (!user) return null;

  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const clicks = await prisma.clickTracking.findMany({
    where: {
      clickedAt: { gte: since },
      ShortLink: { userId: user.id },
    },
    select: {
      clickedAt: true,
      deviceOS: true,
      referrer: true,
      ShortLink: { select: { id: true, Product: { select: { name: true } } } },
    },
    orderBy: { clickedAt: 'asc' },
  });

  const byDay = {};
  const byDevice = {};
  const byReferrer = {};
  const byLink = {};

  // Prefill all days in range
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().split('T')[0]] = 0;
  }

  for (const click of clicks) {
    const day = click.clickedAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;

    const device = click.deviceOS || 'Unknown';
    byDevice[device] = (byDevice[device] || 0) + 1;

    let ref = 'Direct';
    if (click.referrer) {
      try { ref = new URL(click.referrer).hostname; } catch { ref = 'Other'; }
    }
    byReferrer[ref] = (byReferrer[ref] || 0) + 1;

    const linkName = click.ShortLink?.Product?.name || click.ShortLink?.id || 'Unknown';
    byLink[linkName] = (byLink[linkName] || 0) + 1;
  }

  // Revenue estimation per link (uses per-link rates, falls back to user defaults)
  const linkDetails = await prisma.shortLink.findMany({
    where: { userId: user.id },
    select: { commissionRate: true, conversionRate: true, Product: { select: { name: true, currentPrice: true } } },
  });
  const userRecord = await prisma.user.findUnique({ where: { bioPageSlug: slug }, select: { defaultConversionRate: true, defaultCommissionRate: true } });
  const defConv = userRecord?.defaultConversionRate ?? 2;
  const defComm = userRecord?.defaultCommissionRate ?? 5;

  const linkRevMap = {};
  for (const l of linkDetails) {
    linkRevMap[l.Product.name] = {
      commissionRate: l.commissionRate ?? defComm,
      conversionRate: l.conversionRate ?? defConv,
      price: l.Product.currentPrice,
    };
  }

  const revenueByLink = Object.entries(byLink)
    .map(([name, clickCount]) => {
      const info = linkRevMap[name];
      const est = (info?.price && info?.commissionRate && info?.conversionRate)
        ? Math.round(clickCount * (info.conversionRate / 100) * info.price * (info.commissionRate / 100))
        : null;
      return { name, value: clickCount, estimatedRevenue: est };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const totalEstRevenue = revenueByLink.reduce((s, l) => s + (l.estimatedRevenue ?? 0), 0);

  return {
    total: clicks.length,
    totalEstRevenue,
    byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    byDevice: Object.entries(byDevice).map(([name, value]) => ({ name, value })),
    byReferrer: Object.entries(byReferrer).map(([name, value]) => ({ name, value })),
    byLink: revenueByLink,
  };
}
async function getCategories(userId) {
  return await prisma.category.findMany({ where: { userId }, orderBy: { sortOrder: 'asc' } });
}

async function createCategory(userId, name) {
  const maxOrder = await prisma.category.aggregate({ where: { userId }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  return await prisma.category.create({ data: { userId, name, sortOrder: nextOrder } });
}

async function updateCategory(categoryId, userId, { name, sortOrder }) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw Object.assign(new Error('Category không tồn tại.'), { status: 404 });
  if (cat.userId !== userId) throw Object.assign(new Error('Không có quyền.'), { status: 403 });
  return await prisma.category.update({
    where: { id: categoryId },
    data: { name: name ?? undefined, sortOrder: sortOrder ?? undefined },
  });
}

async function deleteCategory(categoryId, userId) {
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) throw Object.assign(new Error('Category không tồn tại.'), { status: 404 });
  if (cat.userId !== userId) throw Object.assign(new Error('Không có quyền.'), { status: 403 });
  await prisma.$transaction([
    prisma.shortLink.updateMany({ where: { categoryId }, data: { categoryId: null } }),
    prisma.category.delete({ where: { id: categoryId } }),
  ]);
}

// ── Revenue: Product Profitability
async function getProductProfitability(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { defaultConversionRate: true, defaultCommissionRate: true } });
  const defConv = user?.defaultConversionRate ?? 2;
  const defComm = user?.defaultCommissionRate ?? 5;

  const links = await prisma.shortLink.findMany({
    where: { userId },
    include: { Product: true, _count: { select: { ClickTrackings: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  return links.map(l => {
    const clicks = l._count.ClickTrackings;
    const cr = l.conversionRate ?? defConv;
    const comm = l.commissionRate ?? defComm;
    const price = l.Product.currentPrice ?? 0;
    const estimatedRevenue = price > 0 ? Math.round(clicks * (cr / 100) * price * (comm / 100)) : null;
    const estimatedOrders = Math.round(clicks * cr / 100);
    return { id: l.id, name: l.Product.name, platform: l.Product.platform, imageUrl: l.Product.imageUrl, price, clicks, commissionRate: comm, conversionRate: cr, estimatedOrders, estimatedRevenue, isActiveOnBio: l.isActiveOnBio, isFeatured: l.isFeatured };
  }).sort((a, b) => (b.estimatedRevenue ?? 0) - (a.estimatedRevenue ?? 0));
}

async function getRevenueEntries(userId) {
  return await prisma.revenueEntry.findMany({ where: { userId }, orderBy: { month: 'desc' } });
}

async function upsertRevenueEntry(userId, { id, month, platform, actualAmount, notes }) {
  if (id) {
    const entry = await prisma.revenueEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) throw Object.assign(new Error('Không có quyền.'), { status: 403 });
    return await prisma.revenueEntry.update({ where: { id }, data: { month, platform, actualAmount: parseFloat(actualAmount), notes: notes || null } });
  }
  return await prisma.revenueEntry.create({ data: { userId, month, platform, actualAmount: parseFloat(actualAmount), notes: notes || null } });
}

async function deleteRevenueEntry(entryId, userId) {
  const entry = await prisma.revenueEntry.findUnique({ where: { id: entryId } });
  if (!entry) throw Object.assign(new Error('Không tồn tại.'), { status: 404 });
  if (entry.userId !== userId) throw Object.assign(new Error('Không có quyền.'), { status: 403 });
  await prisma.revenueEntry.delete({ where: { id: entryId } });
}

module.exports = {
  getBioLinksBySlug,
  getAllLinksBySlug,
  getShortLinkByCode,
  recordClick,
  deleteLink,
  toggleLink,
  editLink,
  updateProductInline,
  bulkLinkAction,
  fetchProductMetadata,
  reorderLinks,
  getLinkStats,
  getAnalytics,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductProfitability,
  getRevenueEntries,
  upsertRevenueEntry,
  deleteRevenueEntry,
};

// ───────────────────────────────────────────────
// Product metadata scraper
// Fetch a product URL and extract:
//   name, imageUrl, currentPrice, platform
// from Open Graph / Twitter / JSON-LD / common patterns.
// Best-effort: returns whatever it can extract.
// ───────────────────────────────────────────────

const SCRAPE_TIMEOUT_MS = 8000;
const SCRAPE_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function detectPlatform(url) {
  const h = url.toLowerCase();
  if (h.includes('shopee.')) return 'Shopee';
  if (h.includes('tiktok.com')) return 'TikTok Shop';
  if (h.includes('lazada.')) return 'Lazada';
  return null;
}

function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function pickMeta(html, names) {
  // Looks for <meta property="X" content="Y"> or <meta name="X" content="Y">
  for (const name of names) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
      `<meta\\s+[^>]*?(?:property|name)\\s*=\\s*["']${esc}["'][^>]*?content\\s*=\\s*["']([^"']*)["']` +
      '|' +
      `<meta\\s+[^>]*?content\\s*=\\s*["']([^"']*)["'][^>]*?(?:property|name)\\s*=\\s*["']${esc}["']`,
      'i',
    );
    const m = html.match(re);
    const v = m && (m[1] || m[2]);
    if (v) return decodeEntities(v).trim();
  }
  return null;
}

function pickTitleTag(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? decodeEntities(m[1]).trim() : null;
}

function parseJsonLdPrice(html) {
  // Extract all JSON-LD blocks and look for price/offers
  const blocks = [...html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1].trim());
      const items = Array.isArray(data) ? data : [data];
      for (const it of items) {
        const offers = it.offers;
        if (offers) {
          const arr = Array.isArray(offers) ? offers : [offers];
          for (const o of arr) {
            const p = o.price || o.lowPrice || o.priceSpecification?.price;
            if (p && Number.isFinite(Number(p))) return Number(p);
          }
        }
        if (it.price && Number.isFinite(Number(it.price))) return Number(it.price);
      }
    } catch { /* skip malformed */ }
  }
  return null;
}

function parsePriceFromMeta(html) {
  // Common meta price tags
  const tags = ['product:price:amount', 'og:price:amount', 'twitter:data1', 'price'];
  for (const t of tags) {
    const v = pickMeta(html, [t]);
    if (v) {
      const cleaned = v.replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
      const n = Number(cleaned);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

async function fetchProductMetadata(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw Object.assign(new Error('URL không hợp lệ.'), { status: 400 });
  }

  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw Object.assign(new Error('URL không đúng định dạng.'), { status: 400 });
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw Object.assign(new Error('Chỉ chấp nhận URL http/https.'), { status: 400 });
  }

  // SSRF guard: deny private / loopback / link-local hosts
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === '::1'
  ) {
    throw Object.assign(new Error('Host không được phép.'), { status: 400 });
  }

  const platform = detectPlatform(url.href);

  let html = '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
    const res = await fetch(url.href, {
      headers: {
        'User-Agent': SCRAPE_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw Object.assign(
        new Error(`Không tải được trang (HTTP ${res.status}).`),
        { status: 502 },
      );
    }

    // Cap response body to ~2MB to avoid memory issues
    const reader = res.body?.getReader();
    if (reader) {
      const chunks = [];
      let total = 0;
      const CAP = 2 * 1024 * 1024;
      while (total < CAP) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
        if (total >= CAP) break;
      }
      html = Buffer.concat(chunks).toString('utf-8');
    } else {
      html = await res.text();
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Trang phản hồi quá chậm (timeout).'), { status: 504 });
    }
    if (err.status) throw err;
    throw Object.assign(new Error('Không kết nối được tới trang.'), { status: 502 });
  }

  // Extract
  let name =
    pickMeta(html, ['og:title', 'twitter:title']) ||
    pickTitleTag(html) ||
    null;

  // Strip common suffixes from titles, e.g. "Tên SP | Shopee Mall"
  if (name) {
    name = name
      .replace(/\s*[|\-–·]\s*Shopee( Mall| Việt Nam| VN)?$/i, '')
      .replace(/\s*[|\-–·]\s*TikTok( Shop)?$/i, '')
      .replace(/\s+Mua trên Shopee.*/i, '')
      .replace(/^Mua\s+/i, '')
      .trim()
      .slice(0, 200);
  }

  const imageUrl =
    pickMeta(html, ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']) ||
    null;

  const currentPrice =
    parsePriceFromMeta(html) ||
    parseJsonLdPrice(html) ||
    null;

  return {
    name,
    imageUrl,
    currentPrice,
    platform,
    originalUrl: url.href,
  };
}

// ───────────────────────────────────────────────
// Inline product edit (name / currentPrice)
// ───────────────────────────────────────────────
async function updateProductInline(linkId, userId, { name, currentPrice }) {
  const link = await prisma.shortLink.findUnique({ where: { id: linkId } });
  if (!link) throw Object.assign(new Error('Link không tồn tại.'), { status: 404 });
  if (link.userId !== userId) throw Object.assign(new Error('Không có quyền thực hiện.'), { status: 403 });

  // Build data with only provided fields
  const data = {};
  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) throw Object.assign(new Error('Tên không được để trống.'), { status: 400 });
    if (trimmed.length > 200) throw Object.assign(new Error('Tên quá dài.'), { status: 400 });
    data.name = trimmed;
  }
  if (currentPrice !== undefined) {
    if (currentPrice === null || currentPrice === '') {
      data.currentPrice = null;
    } else {
      const n = Number(currentPrice);
      if (!Number.isFinite(n) || n < 0) throw Object.assign(new Error('Giá không hợp lệ.'), { status: 400 });
      data.currentPrice = n;
    }
  }

  if (Object.keys(data).length === 0) {
    // No-op — just return current product
    const current = await prisma.product.findUnique({ where: { id: link.productId } });
    return current;
  }

  return await prisma.product.update({
    where: { id: link.productId },
    data,
  });
}

// ───────────────────────────────────────────────
// Bulk action on multiple links
// action: 'hide' | 'show' | 'feature' | 'unfeature' | 'delete'
// ───────────────────────────────────────────────
async function bulkLinkAction(userId, ids, action) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw Object.assign(new Error('Danh sách rỗng.'), { status: 400 });
  }
  if (ids.length > 200) {
    throw Object.assign(new Error('Tối đa 200 sản phẩm mỗi lần.'), { status: 400 });
  }

  // Verify all links belong to user (defence-in-depth)
  const owned = await prisma.shortLink.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });
  const ownedIds = owned.map(l => l.id);
  if (ownedIds.length === 0) {
    throw Object.assign(new Error('Không có quyền thực hiện.'), { status: 403 });
  }

  const where = { id: { in: ownedIds } };

  switch (action) {
    case 'hide':
      await prisma.shortLink.updateMany({ where, data: { isActiveOnBio: false } });
      break;
    case 'show':
      await prisma.shortLink.updateMany({ where, data: { isActiveOnBio: true } });
      break;
    case 'feature':
      await prisma.shortLink.updateMany({ where, data: { isFeatured: true } });
      break;
    case 'unfeature':
      await prisma.shortLink.updateMany({ where, data: { isFeatured: false } });
      break;
    case 'delete':
      await prisma.$transaction([
        prisma.clickTracking.deleteMany({ where: { shortLinkId: { in: ownedIds } } }),
        prisma.shortLink.deleteMany({ where }),
      ]);
      break;
    default:
      throw Object.assign(new Error(`Action không hợp lệ: ${action}`), { status: 400 });
  }

  return { affected: ownedIds.length, ids: ownedIds };
}
