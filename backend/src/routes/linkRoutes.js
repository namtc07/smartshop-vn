const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const userController = require('../controllers/userController');

// ── Auth
router.post('/api/users/register', userController.register);
router.post('/api/users/login', userController.login);
router.patch('/api/users/:userId/profile', userController.updateProfile);

// ── Dashboard (all links + clicks)
router.get('/api/dashboard/:slug', linkController.getDashboardLinks);

// ── Analytics
router.get('/api/analytics/:slug', linkController.getAnalytics);

// ── Link management
router.post('/api/links/generate', linkController.generate);
router.post('/api/links/bulk', linkController.bulkAction);
router.post('/api/links/metadata', linkController.fetchMetadata);
router.delete('/api/links/:id', linkController.deleteLink);
router.patch('/api/links/reorder', linkController.reorderLinks);
router.patch('/api/links/:id/toggle', linkController.toggleLink);
router.patch('/api/links/:id/product', linkController.updateProductInline);
router.patch('/api/links/:id', linkController.editLink);

// ── Stats
router.get('/api/stats/:userId', linkController.getLinkStats);

// ── Categories
router.get('/api/categories/:userId', linkController.getCategories);
router.post('/api/categories', linkController.createCategory);
router.patch('/api/categories/:id', linkController.updateCategory);
router.delete('/api/categories/:id', linkController.deleteCategory);

// ── Revenue
router.get('/api/revenue/profitability/:userId', linkController.getProductProfitability);
router.get('/api/revenue/entries/:userId', linkController.getRevenueEntries);
router.post('/api/revenue/entries', linkController.upsertRevenueEntry);
router.delete('/api/revenue/entries/:id', linkController.deleteRevenueEntry);

// ── Public bio page
router.get('/api/b/:slug', linkController.getBioLinks);

// ── Redirect & tracking
router.get('/:shortCode', linkController.redirectShortLink);

module.exports = router;
