let productData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const pName = document.getElementById('p-name');
  const pPrice = document.getElementById('p-price');
  const pImg = document.getElementById('p-img');
  const pPlatform = document.getElementById('p-platform');
  const btnAdd = document.getElementById('btn-add');
  const affiliateInput = document.getElementById('affiliateUrl');
  const userIdInput = document.getElementById('userId');
  const statusBox = document.getElementById('status-box');

  // Lấy active tab hiện tại
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    showError('Không tìm thấy tab hoạt động.');
    return;
  }

  // Gửi request tới content script
  chrome.tabs.sendMessage(tab.id, { action: 'GET_PRODUCT_INFO' }, (response) => {
    // Check error runtime
    if (chrome.runtime.lastError) {
      showError('Hãy mở một trang chi tiết sản phẩm của Shopee hoặc Lazada.');
      return;
    }

    if (!response || !response.success) {
      showError(response ? response.error : 'Không thể lấy thông tin sản phẩm.');
      return;
    }

    // Hiển thị thông tin lên UI
    productData = response.data;
    pName.innerText = productData.name;
    pPrice.innerText = productData.currentPrice 
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productData.currentPrice)
      : 'Liên hệ shop';
    
    if (productData.imageUrl) {
      pImg.src = productData.imageUrl;
    }
    
    pPlatform.innerText = productData.platform;
    pPlatform.className = `platform-tag ${productData.platform.toLowerCase()}`;

    // Enable button và autofill affiliate url bằng link gốc để tiện test
    affiliateInput.value = productData.originalUrl;
    btnAdd.removeAttribute('disabled');
  });

  // Xử lý sự kiện click thêm sản phẩm
  btnAdd.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const affiliateDeepLink = affiliateInput.value.trim();

    if (!userId) {
      showError('Vui lòng nhập User ID (KOC ID).');
      return;
    }

    if (!affiliateDeepLink) {
      showError('Vui lòng nhập Link Affiliate.');
      return;
    }

    setLoading(true);
    statusBox.style.display = 'none';

    try {
      const response = await fetch('http://localhost:3000/api/links/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          platform: productData.platform,
          originalUrl: productData.originalUrl,
          name: productData.name,
          imageUrl: productData.imageUrl,
          currentPrice: productData.currentPrice,
          affiliateDeepLink: affiliateDeepLink
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Lỗi khi kết nối tới máy chủ.');
      }

      // Tạo thành công
      showSuccess(result.data.shortCode);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  });

  // Helpers
  function showError(msg) {
    statusBox.className = 'status-msg error';
    statusBox.innerText = msg;
    statusBox.style.display = 'block';
  }

  function showSuccess(shortCode) {
    const shortUrl = `http://localhost:3000/${shortCode}`;
    statusBox.className = 'status-msg success-card';
    statusBox.innerHTML = `
      <div class="success-title">Thành công! Link đã được thêm vào Bio Link.</div>
      <div class="result-link-wrapper">
        <div class="result-link" id="short-url-text">${shortUrl}</div>
        <button class="btn-copy" id="btn-copy">Copy</button>
      </div>
    `;
    statusBox.style.display = 'block';

    document.getElementById('btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(shortUrl).then(() => {
        const copyBtn = document.getElementById('btn-copy');
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
      });
    });
  }

  function setLoading(isLoading) {
    const btnLoader = document.getElementById('btn-loader');
    const btnText = document.getElementById('btn-text');
    if (isLoading) {
      btnAdd.setAttribute('disabled', 'true');
      btnLoader.style.display = 'block';
      btnText.innerText = 'Đang xử lý...';
    } else {
      btnAdd.removeAttribute('disabled');
      btnLoader.style.display = 'none';
      btnText.innerText = 'Thêm vào Bio Link';
    }
  }
});
