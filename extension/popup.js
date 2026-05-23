'use strict';

const DEFAULT_API = 'http://localhost:3000';

// ── DOM helpers
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove('hidden');
const hide = id => $(id).classList.add('hidden');

// ── Storage helpers
async function getConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['slug', 'userId', 'apiUrl'], data => resolve(data));
  });
}
async function saveConfig(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

const SCREENS = ['screen-login', 'screen-settings', 'screen-main', 'screen-no-product'];
function only(id) {
  SCREENS.forEach(s => (s === id ? show(s) : hide(s)));
}

// ── Fetch categories from backend
async function fetchCategories(apiUrl, userId) {
  try {
    const res = await fetch(`${apiUrl}/api/categories/${userId}`);
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

// ── Show correct screen on boot
async function init() {
  const config = await getConfig();
  if (!config.slug || !config.userId) {
    only('screen-login');
  } else {
    await showMainScreen(config);
  }
}

async function showMainScreen(config) {
  only('screen-main');

  // Ask content script for product
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let product = null;

  // Inject content script lazily if it didn't load (fixes "Receiving end does not exist")
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT' });
    product = res?.product;
  } catch {
    // Content script not available — try injecting on demand
    try {
      await chrome.scripting?.executeScript?.({ target: { tabId: tab.id }, files: ['content.js'] });
      const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT' });
      product = res?.product;
    } catch { /* unsupported page */ }
  }

  if (!product?.name) {
    only('screen-no-product');
    return;
  }

  // Populate card
  $('product-name').textContent = product.name;
  $('product-price').textContent = product.currentPrice
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
    : 'Chưa lấy được giá';

  const badge = $('product-platform');
  badge.textContent = product.platform;
  badge.className = 'platform-badge platform-' + product.platform.toLowerCase().split(' ')[0];

  if (product.imageUrl) {
    $('product-img').src = product.imageUrl;
    $('product-img').style.display = 'block';
    $('product-img').onerror = () => { $('product-img').style.display = 'none'; };
  } else {
    $('product-img').style.display = 'none';
  }

  // Pre-fill affiliate deep link with originalUrl (user replaces with affiliate link)
  if (!$('input-affiliate').value) {
    $('input-affiliate').value = product.originalUrl;
  }

  // Populate categories dropdown
  const catSelect = $('input-category');
  if (catSelect) {
    catSelect.innerHTML = '<option value="">— Không có danh mục —</option>';
    const cats = await fetchCategories(config.apiUrl || DEFAULT_API, config.userId);
    for (const c of cats) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      catSelect.appendChild(opt);
    }
  }

  // Store product data for submit
  window._product = product;
  window._config = config;
}

function showSettingsScreen(config) {
  only('screen-settings');
  $('settings-info').textContent = `@${config.slug}  •  ${config.userId?.slice(0, 8)}...`;
  $('settings-api').value = config.apiUrl || DEFAULT_API;
}

// ── Save login
$('btn-save-login').addEventListener('click', async () => {
  const slug = $('input-slug').value.trim();
  const userId = $('input-userid').value.trim();
  const apiUrl = ($('input-api').value.trim() || DEFAULT_API).replace(/\/$/, '');

  if (!slug || !userId) {
    $('login-error').textContent = 'Vui lòng nhập đầy đủ slug và User ID.';
    show('login-error');
    return;
  }
  hide('login-error');

  $('btn-save-login').disabled = true;
  $('btn-save-login').textContent = 'Đang kiểm tra...';
  try {
    const res = await fetch(`${apiUrl}/api/dashboard/${slug}`);
    if (!res.ok) throw new Error('Không tìm thấy tài khoản.');
    const json = await res.json();
    if (!json.success) throw new Error('Slug không hợp lệ.');
    // Verify userId matches
    if (json.data?.user?.id && json.data.user.id !== userId) {
      throw new Error('User ID không khớp với slug.');
    }
  } catch (e) {
    $('login-error').textContent = e.message || 'Lỗi kết nối API.';
    show('login-error');
    $('btn-save-login').disabled = false;
    $('btn-save-login').textContent = 'Lưu & kết nối';
    return;
  }

  await saveConfig({ slug, userId, apiUrl });
  $('btn-save-login').disabled = false;
  $('btn-save-login').textContent = 'Lưu & kết nối';
  await showMainScreen({ slug, userId, apiUrl });
});

// ── Settings toggle
$('btn-settings').addEventListener('click', async () => {
  const config = await getConfig();
  if ($('screen-settings').classList.contains('hidden')) {
    showSettingsScreen(config);
  } else {
    if (config.slug) await showMainScreen(config);
    else only('screen-login');
  }
});

// ── Update settings
$('btn-update-settings').addEventListener('click', async () => {
  const config = await getConfig();
  const apiUrl = $('settings-api').value.trim().replace(/\/$/, '') || DEFAULT_API;
  await saveConfig({ ...config, apiUrl });
  await showMainScreen({ ...config, apiUrl });
});

// ── Logout
$('btn-logout').addEventListener('click', async () => {
  await chrome.storage.local.clear();
  only('screen-login');
});

// ── Open dashboard
$('btn-open-dashboard')?.addEventListener('click', async () => {
  const config = await getConfig();
  const url = (config.apiUrl || DEFAULT_API).replace(/\/api$/, '').replace(/:3000$/, ':3001');
  // Dashboard typically lives at frontend domain — try common patterns
  chrome.tabs.create({ url: `${url.replace(':3000', ':3001')}/dashboard` });
});

// ── Add product
$('btn-add').addEventListener('click', async () => {
  const affiliateDeepLink = $('input-affiliate').value.trim();
  if (!affiliateDeepLink) {
    $('add-error').textContent = 'Vui lòng nhập Affiliate Deep Link.';
    show('add-error');
    return;
  }
  hide('add-error');
  hide('add-success');

  const product = window._product;
  const config = window._config;
  const isFeatured = $('toggle-featured').checked;
  const badgeText = $('input-badge').value.trim() || null;
  const categoryId = $('input-category')?.value || null;

  $('btn-add').disabled = true;
  $('btn-add').innerHTML = '<span class="spinner"></span> Đang thêm...';

  try {
    const apiUrl = config.apiUrl || DEFAULT_API;
    const res = await fetch(`${apiUrl}/api/links/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: config.userId,
        platform: product.platform,
        originalUrl: product.originalUrl,
        name: product.name,
        imageUrl: product.imageUrl || null,
        currentPrice: product.currentPrice || null,
        affiliateDeepLink,
        isFeatured,
        badgeText,
        categoryId,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Thêm thất bại.');

    show('add-success');
    $('input-affiliate').value = '';
    $('input-badge').value = '';
    $('toggle-featured').checked = false;
    if ($('input-category')) $('input-category').value = '';
    setTimeout(() => hide('add-success'), 3000);
  } catch (e) {
    $('add-error').textContent = e.message;
    show('add-error');
  } finally {
    $('btn-add').disabled = false;
    $('btn-add').innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Thêm vào Bio Link`;
  }
});

// ── Refresh button (re-extract product)
$('btn-refresh')?.addEventListener('click', async () => {
  const config = await getConfig();
  await showMainScreen(config);
});

// ── Boot
init();
