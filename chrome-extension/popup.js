// URL backend production
const API_BASE_URL = 'https://smartshop-vn.onrender.com';

// Keys lưu trong chrome.storage.sync
const STORAGE_KEY_USER_ID = 'koc_user_id';
const STORAGE_KEY_SLUG    = 'koc_slug';

document.addEventListener('DOMContentLoaded', async () => {
  const setupScreen = document.getElementById('setup-screen');
  const appScreen   = document.getElementById('app-screen');

  // ─── Kiểm tra userId đã lưu chưa ───
  chrome.storage.sync.get([STORAGE_KEY_USER_ID, STORAGE_KEY_SLUG], (result) => {
    if (result[STORAGE_KEY_USER_ID] && result[STORAGE_KEY_SLUG]) {
      showAppScreen(result[STORAGE_KEY_USER_ID], result[STORAGE_KEY_SLUG]);
    } else {
      showSetupScreen();
    }
  });

  // ─── SETUP SCREEN: Nhập bio slug → resolve userId ───
  function showSetupScreen() {
    setupScreen.style.display = 'block';
    appScreen.style.display   = 'none';

    const errBox  = document.getElementById('setup-error');
    const btnSave = document.getElementById('btn-save-user');
    const slugInput = document.getElementById('setup-slug');

    // Xử lý khi nhấn Xác nhận
    btnSave.addEventListener('click', async () => {
      const slug = slugInput.value.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

      if (!slug) {
        showStatusMsg(errBox, 'error', 'Vui lòng nhập Bio Slug của bạn.');
        return;
      }

      // Loading state
      btnSave.setAttribute('disabled', 'true');
      btnSave.innerText = 'Đang xác nhận...';
      errBox.style.display = 'none';

      try {
        // Gọi API để resolve slug → userId
        const res = await fetch(`${API_BASE_URL}/api/b/${slug}`);

        if (res.status === 404) {
          throw new Error(`Không tìm thấy trang bio "${slug}". Kiểm tra lại slug.`);
        }
        if (!res.ok) {
          throw new Error('Lỗi kết nối tới máy chủ. Thử lại sau.');
        }

        const data = await res.json();

        // API trả về { user: { id, email, bioPageSlug, ... }, links: [...] }
        const userId = data.user?.id;
        if (!userId) {
          throw new Error('Không lấy được thông tin user. Liên hệ admin.');
        }

        // Lưu vào chrome.storage.sync
        chrome.storage.sync.set({
          [STORAGE_KEY_USER_ID]: userId,
          [STORAGE_KEY_SLUG]: slug
        }, () => {
          showAppScreen(userId, slug);
        });

      } catch (err) {
        showStatusMsg(errBox, 'error', err.message);
        btnSave.removeAttribute('disabled');
        btnSave.innerText = '✅  Xác nhận và tiếp tục';
      }
    });

    // Nhấn Enter trong input cũng trigger
    slugInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnSave.click();
    });
  }

  // ─── APP SCREEN: Màn hình chính ───
  function showAppScreen(userId, slug) {
    setupScreen.style.display = 'none';
    appScreen.style.display   = 'block';

    // Hiển thị slug trên chip (dễ đọc hơn UUID)
    const chipEl = document.getElementById('chip-user-id');
    chipEl.innerText = `/${slug}`;
    chipEl.title     = `User ID: ${userId}`;

    // Nút "Đổi user" → xoá storage và quay về màn setup
    // Cần removeEventListener cũ trước để tránh đăng ký trùng khi switch user
    const btnChange = document.getElementById('btn-change-user');
    const newBtnChange = btnChange.cloneNode(true);
    btnChange.parentNode.replaceChild(newBtnChange, btnChange);

    newBtnChange.addEventListener('click', () => {
      chrome.storage.sync.remove([STORAGE_KEY_USER_ID, STORAGE_KEY_SLUG], () => {
        // Reset UI
        document.getElementById('affiliateUrl').value   = '';
        document.getElementById('status-box').style.display = 'none';
        document.getElementById('btn-add').setAttribute('disabled', 'true');
        document.getElementById('btn-text').innerText = 'Thêm vào Bio Link';
        document.getElementById('p-name').innerText   = 'Đang lấy dữ liệu sản phẩm...';
        document.getElementById('p-price').innerText  = 'đ0';

        showSetupScreen();
      });
    });

    // Tải thông tin sản phẩm từ content script
    loadProductInfo(userId);
  }

  // ─── Lấy thông tin sản phẩm từ tab hiện tại ───
  function loadProductInfo(userId) {
    const pName          = document.getElementById('p-name');
    const pPrice         = document.getElementById('p-price');
    const pImg           = document.getElementById('p-img');
    const pPlatform      = document.getElementById('p-platform');
    const btnAdd         = document.getElementById('btn-add');
    const affiliateInput = document.getElementById('affiliateUrl');
    const statusBox      = document.getElementById('status-box');

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab) {
        showStatusMsg(statusBox, 'error', 'Không tìm thấy tab hoạt động.');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'GET_PRODUCT_INFO' }, (response) => {
        if (chrome.runtime.lastError) {
          showStatusMsg(statusBox, 'error', 'Hãy mở một trang chi tiết sản phẩm của Shopee hoặc Lazada.');
          return;
        }

        if (!response || !response.success) {
          showStatusMsg(statusBox, 'error', response ? response.error : 'Không thể lấy thông tin sản phẩm.');
          return;
        }

        const data = response.data;
        pName.innerText = data.name;
        pPrice.innerText = data.currentPrice
          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.currentPrice)
          : 'Liên hệ shop';

        if (data.imageUrl) pImg.src = data.imageUrl;
        pPlatform.innerText = data.platform;
        pPlatform.className = `platform-tag ${data.platform.toLowerCase()}`;

        affiliateInput.value = data.originalUrl;

        // Clone để xoá listener cũ (tránh double-fire khi switch user)
        const oldBtn = btnAdd;
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.removeAttribute('disabled');

        newBtn.addEventListener('click', async () => {
          const affiliateDeepLink = affiliateInput.value.trim();

          if (!affiliateDeepLink) {
            showStatusMsg(statusBox, 'error', 'Vui lòng nhập Affiliate Link.');
            return;
          }

          setLoading(true, newBtn);
          statusBox.style.display = 'none';

          try {
            const res = await fetch(`${API_BASE_URL}/api/links/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                platform: data.platform,
                originalUrl: data.originalUrl,
                name: data.name,
                imageUrl: data.imageUrl,
                currentPrice: data.currentPrice,
                affiliateDeepLink
              })
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
              throw new Error(result.message || 'Lỗi kết nối tới máy chủ.');
            }

            showSuccess(statusBox, result.data.shortCode);
          } catch (err) {
            showStatusMsg(statusBox, 'error', err.message);
          } finally {
            setLoading(false, newBtn);
          }
        });
      });
    });
  }

  // ─── Helpers ───
  function showStatusMsg(box, type, msg) {
    box.className    = `status-msg ${type}`;
    box.innerText    = msg;
    box.style.display = 'block';
  }

  function showSuccess(box, shortCode) {
    const shortUrl = `${API_BASE_URL}/${shortCode}`;
    box.className  = 'status-msg success-card';
    box.innerHTML  = `
      <div class="success-title">✅ Đã thêm vào Bio Link!</div>
      <div class="result-link-wrapper">
        <div class="result-link" id="short-url-text">${shortUrl}</div>
        <button class="btn-copy" id="btn-copy">Copy</button>
      </div>
    `;
    box.style.display = 'block';

    document.getElementById('btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(shortUrl).then(() => {
        const copyBtn = document.getElementById('btn-copy');
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
      });
    });
  }

  function setLoading(isLoading, btn) {
    const btnLoader = document.getElementById('btn-loader');
    const btnText   = document.getElementById('btn-text');
    if (isLoading) {
      btn.setAttribute('disabled', 'true');
      if (btnLoader) btnLoader.style.display = 'block';
      if (btnText)   btnText.innerText = 'Đang xử lý...';
    } else {
      btn.removeAttribute('disabled');
      if (btnLoader) btnLoader.style.display = 'none';
      if (btnText)   btnText.innerText = 'Thêm vào Bio Link';
    }
  }
});
