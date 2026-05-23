// Content script: extract product info from Shopee / Lazada / TikTok Shop

function detectPlatform() {
  const h = location.hostname;
  if (h.includes('shopee')) return 'Shopee';
  if (h.includes('lazada')) return 'Lazada';
  if (h.includes('tiktok')) return 'TikTok Shop';
  return null;
}

function getShopeeProduct() {
  const name =
    document.querySelector('.pdp-product-title')?.textContent?.trim() ||
    document.querySelector('h1[class*="product-name"]')?.textContent?.trim() ||
    document.title.replace(' | Shopee', '').trim();

  const priceEl =
    document.querySelector('.pdp-price_size_xl') ||
    document.querySelector('[class*="price--current"]') ||
    document.querySelector('[class*="pdp-price"]');
  const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '';
  const price = priceText ? parseInt(priceText, 10) : null;

  const imgEl =
    document.querySelector('.pdp-image img') ||
    document.querySelector('[class*="gallery"] img') ||
    document.querySelector('img[alt*="product"]');
  const imageUrl = imgEl?.src || null;

  return { name, price, imageUrl };
}

function getLazadaProduct() {
  const name =
    document.querySelector('[data-spm="title"] h1')?.textContent?.trim() ||
    document.querySelector('.pdp-product-title')?.textContent?.trim() ||
    document.title.replace(' - Lazada', '').trim();

  const priceEl = document.querySelector('.pdp-price_type_normal') || document.querySelector('[class*="price-box"]');
  const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '';
  const price = priceText ? parseInt(priceText, 10) : null;

  const imgEl = document.querySelector('.gallery-preview-panel__image') || document.querySelector('[class*="gallery"] img');
  const imageUrl = imgEl?.src || null;

  return { name, price, imageUrl };
}

function getTikTokProduct() {
  const name =
    document.querySelector('[data-e2e="product-title"]')?.textContent?.trim() ||
    document.querySelector('h1[class*="ProductTitle"]')?.textContent?.trim() ||
    document.title.replace(' | TikTok', '').trim();

  const priceEl = document.querySelector('[data-e2e="product-price"]') || document.querySelector('[class*="price"]');
  const priceText = priceEl?.textContent?.replace(/[^\d]/g, '') || '';
  const price = priceText ? parseInt(priceText, 10) : null;

  const imgEl = document.querySelector('[data-e2e="product-image"] img') || document.querySelector('[class*="ProductImage"] img');
  const imageUrl = imgEl?.src || null;

  return { name, price, imageUrl };
}

function extractProduct() {
  const platform = detectPlatform();
  if (!platform) return null;

  let info;
  if (platform === 'Shopee') info = getShopeeProduct();
  else if (platform === 'Lazada') info = getLazadaProduct();
  else info = getTikTokProduct();

  return {
    platform,
    name: info.name || document.title,
    originalUrl: location.href,
    imageUrl: info.imageUrl,
    currentPrice: info.price,
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_PRODUCT') {
    sendResponse({ product: extractProduct() });
  }
  return true;
});
