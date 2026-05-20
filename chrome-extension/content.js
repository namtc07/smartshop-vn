// Listener nhận request từ extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GET_PRODUCT_INFO') {
    try {
      const info = extractProductInfo();
      sendResponse({ success: true, data: info });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Giữ kết nối async
});

function isProductPage() {
  const url = window.location.href;
  const isShopeeProduct = url.includes('shopee.vn') && (url.includes('-i.') || url.includes('/product/'));
  const isLazadaProduct = url.includes('lazada.vn') && url.includes('/products/') && url.includes('.html');
  return isShopeeProduct || isLazadaProduct;
}

function extractProductInfo() {
  if (!isProductPage()) {
    throw new Error('Đây không phải là trang chi tiết sản phẩm Shopee hoặc Lazada.');
  }

  const url = window.location.href.split('?')[0]; // Lấy link gốc bỏ query params
  const platform = url.includes('shopee.vn') ? 'Shopee' : 'Lazada';

  let name = '';
  let imageUrl = '';
  let currentPrice = null;

  // Cách 1: Thử parse từ script application/ld+json (Chuẩn SEO của Shopee & Lazada)
  const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of ldJsonScripts) {
    try {
      const data = JSON.parse(script.textContent);
      // ld+json có thể là Object Product hoặc Array chứa Object Product
      const productObj = Array.isArray(data) ? data.find(item => item['@type'] === 'Product') : (data['@type'] === 'Product' ? data : null);
      
      if (productObj) {
        name = productObj.name || name;
        imageUrl = Array.isArray(productObj.image) ? productObj.image[0] : (productObj.image || imageUrl);
        
        if (productObj.offers) {
          const offers = productObj.offers;
          if (Array.isArray(offers)) {
            currentPrice = parseFloat(offers[0].price || offers[0].lowPrice) || currentPrice;
          } else {
            currentPrice = parseFloat(offers.price || offers.lowPrice) || currentPrice;
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi khi parse LD+JSON:', e);
    }
  }

  // Cách 2: Fallback qua window.__PRELOADED_STATE__ (Shopee)
  if (platform === 'Shopee' && (!name || !currentPrice)) {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.textContent.includes('__PRELOADED_STATE__')) {
        try {
          const match = script.textContent.match(/window\.__PRELOADED_STATE__\s*=\s*({.+});?/);
          if (match) {
            const state = JSON.parse(match[1]);
            // Shopee product detail state structure
            const item = state.product?.productDetail || state.item?.itemDetail;
            if (item) {
              name = item.name || name;
              imageUrl = item.image ? `https://down-vn.img.susercontent.com/file/${item.image}` : imageUrl;
              // Giá trong state của Shopee thường nhân với 100000 (đơn vị nhỏ nhất)
              if (item.price) {
                currentPrice = item.price / 100000;
              } else if (item.price_min) {
                currentPrice = item.price_min / 100000;
              }
            }
          }
        } catch (e) {
          console.warn('Lỗi khi parse Shopee Preloaded State:', e);
        }
      }
    }
  }

  // Cách 3: Fallback qua Open Graph meta tags (Thường có đủ URL, Title, Image)
  if (!name) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) name = ogTitle.getAttribute('content');
  }
  if (!imageUrl) {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) imageUrl = ogImage.getAttribute('content');
  }

  // Fallback lấy giá trên Lazada qua DOM selector cố định hoặc thẻ metadata
  if (platform === 'Lazada' && !currentPrice) {
    // Lazada Apollo State fallback
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.textContent.includes('__apolloState__')) {
        try {
          const match = script.textContent.match(/window\.__apolloState__\s*=\s*({.+});?/);
          if (match) {
            const state = JSON.parse(match[1]);
            // Duyệt key tìm price
            for (const key in state) {
              if (key.startsWith('Fields') && state[key].price) {
                currentPrice = parseFloat(state[key].price.originalPrice || state[key].price.salePrice);
                break;
              }
            }
          }
        } catch (e) {}
      }
    }
  }

  // Clean data
  name = name ? name.trim() : 'Sản phẩm không tên';
  
  return {
    platform,
    originalUrl: url,
    name,
    imageUrl,
    currentPrice
  };
}
