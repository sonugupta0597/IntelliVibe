const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googlePopupAuth } = require('../controllers/authController');

console.log('authRoutes.js loaded');
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google/popup', googlePopupAuth);

module.exports = router;