// SmartShop content script
// Extracts product info from Shopee / Lazada / TikTok Shop using a
// multi-layer fallback strategy (JSON-LD → window state → DOM selectors → meta tags).
// Re-extracts on SPA navigation (history pushState / popstate).

(() => {
  'use strict';

  // ───────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────

  function detectPlatform() {
    const h = location.hostname.toLowerCase();
    if (h.includes('shopee')) return 'Shopee';
    if (h.includes('lazada')) return 'Lazada';
    if (h.includes('tiktok')) return 'TikTok Shop';
    return null;
  }

  function text(el) {
    return el && el.textContent ? el.textContent.trim() : '';
  }

  function attr(el, name) {
    return el && el.getAttribute ? el.getAttribute(name) : null;
  }

  function pickFirst(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function pickFirstText(selectors) {
    for (const s of selectors) {
      const t = text(document.querySelector(s));
      if (t) return t;
    }
    return '';
  }

  function parsePrice(raw) {
    if (raw == null) return null;
    if (typeof raw === 'number') return raw;
    const cleaned = String(raw).replace(/[^\d.,]/g, '');
    if (!cleaned) return null;
    // Vietnamese style: 1.234.567 → drop dots used as thousands separator
    const normalized = cleaned.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/,/g, '.');
    const n = Number(normalized);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function safeImage(src) {
    if (!src) return null;
    // Skip placeholder / base64 lazy-load src
    if (src.startsWith('data:')) return null;
    if (src.length < 12) return null;
    // Lazy-loaded images may put real src in data-src
    return src;
  }

  // ── Try parsing all JSON-LD blocks for Product → name/image/price
  function fromJsonLd() {
    const blocks = document.querySelectorAll('script[type="application/ld+json"]');
    for (const b of blocks) {
      try {
        const txt = b.textContent || '';
        if (!txt.trim()) continue;
        const data = JSON.parse(txt);
        const items = Array.isArray(data) ? data : [data];
        for (const it of items) {
          if (!it) continue;
          const type = it['@type'];
          const isProduct =
            type === 'Product' ||
            (Array.isArray(type) && type.includes('Product'));
          if (!isProduct) continue;

          let price = null;
          if (it.offers) {
            const offers = Array.isArray(it.offers) ? it.offers[0] : it.offers;
            price = parsePrice(offers.price || offers.lowPrice);
          }
          let image = null;
          if (it.image) {
            image = Array.isArray(it.image) ? it.image[0] : it.image;
            if (typeof image === 'object') image = image.url || image['@id'];
          }
          return {
            name: typeof it.name === 'string' ? it.name : null,
            imageUrl: safeImage(image),
            currentPrice: price,
          };
        }
      } catch { /* skip */ }
    }
    return null;
  }

  // ── Try common SPA global state objects (Shopee / Lazada / TikTok)
  function fromWindowState() {
    try {
      // Shopee
      const wAny = window;
      const shopeeData =
        wAny.__INITIAL_STATE__?.product?.itemData ||
        wAny.__INITIAL_STATE__?.itemPage ||
        wAny.__APOLLO_STATE__?.ROOT_QUERY;
      if (shopeeData?.name) {
        const imageId = shopeeData.image || (shopeeData.images && shopeeData.images[0]);
        return {
          name: shopeeData.name,
          imageUrl: imageId ? `https://down-vn.img.susercontent.com/file/${imageId}` : null,
          currentPrice: parsePrice(shopeeData.price ? shopeeData.price / 100000 : null),
        };
      }
      // Lazada
      if (wAny.__moduleData__?.data?.root?.fields) {
        const f = wAny.__moduleData__.data.root.fields;
        return {
          name: f?.product?.title || f?.skuInfos?.[Object.keys(f.skuInfos || {})[0]]?.title || null,
          imageUrl: f?.skuGalleries?.[Object.keys(f.skuGalleries || {})[0]]?.[0]?.src || null,
          currentPrice: parsePrice(f?.skuInfos?.[Object.keys(f.skuInfos || {})[0]]?.price?.salePrice?.value),
        };
      }
      // TikTok Shop
      if (wAny.SIGI_STATE?.ItemModule) {
        const items = Object.values(wAny.SIGI_STATE.ItemModule);
        if (items.length) {
          const it = items[0];
          return {
            name: it.title || it.desc || null,
            imageUrl: it.video?.cover || it.coverUrl || null,
            currentPrice: null,
          };
        }
      }
    } catch { /* swallow */ }
    return null;
  }

  // ── Open Graph + meta fallback
  function fromMeta() {
    const get = name => attr(
      document.querySelector(`meta[property="${name}"]`) ||
      document.querySelector(`meta[name="${name}"]`),
      'content',
    );
    const price = parsePrice(get('product:price:amount') || get('og:price:amount') || get('twitter:data1'));
    return {
      name: get('og:title') || get('twitter:title') || null,
      imageUrl: safeImage(get('og:image:secure_url') || get('og:image') || get('twitter:image')),
      currentPrice: price,
    };
  }

  // ── Platform-specific DOM scraping (latest selectors as of 2026)
  function fromShopeeDom() {
    const name = pickFirstText([
      'div.WBVL_7',                         // 2025-2026 product title
      '.attM6y',                            // alternative
      '.vR6K3w',
      'div[class*="product-briefing"] h1',
      'div[class*="product-briefing"] span',
      '.pdp-product-title',
      'h1[class*="product"]',
    ]);

    const priceText = pickFirstText([
      'div.IZPeQz',                         // 2025-2026 current price
      'div.G27FPf',
      '.pqTWkA',
      '[class*="price--current"]',
      '.pdp-price_size_xl',
      '[class*="pdp-price"]',
    ]);

    const imgEl = pickFirst([
      'div.uXN1L5 img',                     // main gallery
      'picture img[src*="susercontent"]',
      '.pdp-image img',
      'img[class*="product-image"]',
      'div[class*="ImageCarousel"] img',
    ]);
    const imageUrl = safeImage(imgEl ? (attr(imgEl, 'src') || attr(imgEl, 'data-src')) : null);

    return { name, imageUrl, currentPrice: parsePrice(priceText) };
  }

  function fromLazadaDom() {
    const name = pickFirstText([
      'h1.pdp-mod-product-badge-title',
      '[data-spm="title"] h1',
      '.pdp-product-title',
      'h1.pdp-title',
    ]);
    const priceText = pickFirstText([
      '.pdp-price_type_normal',
      '.pdp-price_color_orange',
      '[class*="price-box"]',
      'span.pdp-price',
    ]);
    const imgEl = pickFirst([
      '.gallery-preview-panel__image',
      '.next-slick-active img',
      '[class*="gallery"] img',
    ]);
    return {
      name,
      imageUrl: safeImage(imgEl ? (attr(imgEl, 'src') || attr(imgEl, 'data-src')) : null),
      currentPrice: parsePrice(priceText),
    };
  }

  function fromTikTokDom() {
    const name = pickFirstText([
      '[data-e2e="product-title"]',
      'h1[class*="ProductTitle"]',
      '.product-title',
      'h1',
    ]);
    const priceText = pickFirstText([
      '[data-e2e="product-price"]',
      '[class*="ProductPrice"]',
      '[class*="price"]',
    ]);
    const imgEl = pickFirst([
      '[data-e2e="product-image"] img',
      '[class*="ProductImage"] img',
      'div[class*="ProductCard"] img',
    ]);
    return {
      name,
      imageUrl: safeImage(imgEl ? (attr(imgEl, 'src') || attr(imgEl, 'data-src')) : null),
      currentPrice: parsePrice(priceText),
    };
  }

  // ───────────────────────────────────────────────
  // Main extractor — runs layers in order, merges
  // ───────────────────────────────────────────────

  function extractProduct() {
    const platform = detectPlatform();
    if (!platform) return null;

    // Detect: must be product page, not a listing/home
    // (heuristic: URL contains common product slug patterns)
    const url = location.href;
    const isProductPage =
      /shopee\.[^/]+\/(?:[^/]+-)?i\.\d+\.\d+/.test(url) ||
      /lazada\.vn\/products\/i\d+/.test(url) ||
      /tiktok\.com\/(?:view|@[^/]+\/(?:video|product))/.test(url) ||
      // fallback: trust the page if it has a product-shaped <h1>
      !!document.querySelector('h1');

    if (!isProductPage) return null;

    const layers = [
      fromJsonLd,
      fromWindowState,
      platform === 'Shopee' ? fromShopeeDom : platform === 'Lazada' ? fromLazadaDom : fromTikTokDom,
      fromMeta,
    ];

    let merged = { name: null, imageUrl: null, currentPrice: null };
    for (const layer of layers) {
      try {
        const result = layer();
        if (!result) continue;
        if (!merged.name && result.name) merged.name = result.name;
        if (!merged.imageUrl && result.imageUrl) merged.imageUrl = result.imageUrl;
        if (merged.currentPrice == null && result.currentPrice != null) merged.currentPrice = result.currentPrice;
        // Stop early when we have all 3
        if (merged.name && merged.imageUrl && merged.currentPrice != null) break;
      } catch { /* skip layer */ }
    }

    // Clean title suffix
    if (merged.name) {
      merged.name = merged.name
        .replace(/\s*[|\-–·]\s*Shopee( Mall| Việt Nam| VN)?$/i, '')
        .replace(/\s*[|\-–·]\s*TikTok( Shop)?$/i, '')
        .replace(/\s*[|\-–·]\s*Lazada( Việt Nam| VN)?$/i, '')
        .replace(/^Mua\s+/i, '')
        .trim()
        .slice(0, 200);
    }

    if (!merged.name) return null;

    return {
      platform,
      name: merged.name,
      originalUrl: location.href,
      imageUrl: merged.imageUrl,
      currentPrice: merged.currentPrice,
      scrapedAt: Date.now(),
    };
  }

  // ───────────────────────────────────────────────
  // SPA navigation watcher — re-extract on URL change
  // ───────────────────────────────────────────────

  let lastUrl = location.href;
  let cachedProduct = null;
  let extractTimer = null;

  function tryExtract() {
    cachedProduct = extractProduct();
  }

  // Initial + retry attempts (Shopee/TikTok hydrate after a delay)
  function scheduleExtract() {
    if (extractTimer) clearTimeout(extractTimer);
    tryExtract();
    let attempts = 0;
    const max = 8;
    const tick = () => {
      attempts++;
      if (cachedProduct && cachedProduct.name && cachedProduct.imageUrl && cachedProduct.currentPrice != null) return;
      if (attempts >= max) return;
      tryExtract();
      extractTimer = setTimeout(tick, 500 + attempts * 200);
    };
    extractTimer = setTimeout(tick, 500);
  }

  scheduleExtract();

  // Detect URL changes (SPA push state)
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      cachedProduct = null;
      scheduleExtract();
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  // ───────────────────────────────────────────────
  // Message bridge to popup
  // ───────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_PRODUCT') {
      // Re-extract synchronously to get latest values
      const fresh = extractProduct();
      const product = fresh || cachedProduct;
      sendResponse({ product });
      return false; // sync response
    }
    if (msg.type === 'PING') {
      sendResponse({ ok: true });
      return false;
    }
    return false;
  });
})();
