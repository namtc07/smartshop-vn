const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const userController = require('../controllers/userController');

// Đăng ký tài khoản KOC mới
router.post('/api/users/register', userController.register);

// Đăng nhập bằng email + slug
router.post('/api/users/login', userController.login);

// Giai đoạn 2: API generate short link
router.post('/api/links/generate', linkController.generate);

// Giai đoạn 2: API lấy toàn bộ ShortLink của KOC theo slug
router.get('/api/b/:slug', linkController.getBioLinks);

// Giai đoạn 2: API Tracking & Redirect 302
router.get('/:shortCode', linkController.redirectShortLink);

module.exports = router;
