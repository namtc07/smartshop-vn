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

// ── Link management
router.post('/api/links/generate', linkController.generate);
router.delete('/api/links/:id', linkController.deleteLink);
router.patch('/api/links/reorder', linkController.reorderLinks);
router.patch('/api/links/:id/toggle', linkController.toggleLink);
router.patch('/api/links/:id', linkController.editLink);

// ── Stats
router.get('/api/stats/:userId', linkController.getLinkStats);

// ── Public bio page
router.get('/api/b/:slug', linkController.getBioLinks);

// ── Redirect & tracking
router.get('/:shortCode', linkController.redirectShortLink);

module.exports = router;
