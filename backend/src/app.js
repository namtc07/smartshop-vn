require('dotenv').config();
const express = require('express');
const cors = require('cors');
const linkRoutes = require('./routes/linkRoutes');

const app = express();

// Cho phép truy cập từ mọi nguồn (tiện cho development của Chrome Extension và Next.js)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Route mặc định cho root check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'SmartShop Backend' });
});

// Đăng ký routes
app.use('/', linkRoutes);

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
