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

// ── Show correct screen
async function init() {
  const config = await getConfig();
  if (!config.slug || !config.userId) {
    showLoginScreen();
  } else {
    await showMainScreen(config);
  }
}

function showLoginScreen() {
  hide('screen-main');
  hide('screen-settings');
  hide('screen-no-product');
  show('screen-login');
}

async function showMainScreen(config) {
  hide('screen-login');
  hide('screen-settings');
  show('screen-main');

  // Ask content script for product
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let product = null;

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT' });
    product = res?.product;
  } catch {
    // Content script not injected on this page
  }

  if (!product?.name) {
    hide('screen-main');
    show('screen-no-product');
    return;
  }

  // Populate card
  $('product-name').textContent = product.name;
  $('product-price').textContent = product.currentPrice
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)
    : '';

  const badge = $('product-platform');
  badge.textContent = product.platform;
  badge.className = 'platform-badge platform-' + product.platform.toLowerCase().split(' ')[0];

  if (product.imageUrl) {
    $('product-img').src = product.imageUrl;
    $('product-img').style.display = 'block';
  } else {
    $('product-img').style.display = 'none';
  }

  // Store product data on window for submit
  window._product = product;
  window._config = config;
}

function showSettingsScreen(config) {
  hide('screen-login');
  hide('screen-main');
  hide('screen-no-product');
  show('screen-settings');

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

  // Validate by calling the dashboard API
  $('btn-save-login').disabled = true;
  $('btn-save-login').textContent = 'Đang kiểm tra...';
  try {
    const res = await fetch(`${apiUrl}/api/dashboard/${slug}`);
    if (!res.ok) throw new Error('Không tìm thấy tài khoản.');
    const json = await res.json();
    if (!json.success) throw new Error('Slug không hợp lệ.');
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

// ── Settings button
$('btn-settings').addEventListener('click', async () => {
  const config = await getConfig();
  if ($('screen-settings').classList.contains('hidden')) {
    showSettingsScreen(config);
  } else {
    if (config.slug) await showMainScreen(config);
    else showLoginScreen();
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
  showLoginScreen();
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

  $('btn-add').disabled = true;
  $('btn-add').textContent = 'Đang thêm...';

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
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Thêm thất bại.');

    show('add-success');
    $('input-affiliate').value = '';
    $('input-badge').value = '';
    $('toggle-featured').checked = false;
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

// ── Boot
init();
