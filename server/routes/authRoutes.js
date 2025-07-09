const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googlePopupAuth, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

console.log('authRoutes.js loaded');
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google/popup', googlePopupAuth);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;