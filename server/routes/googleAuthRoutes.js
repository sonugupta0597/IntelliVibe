const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
    // Issue JWT
    const user = req.user;
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token (or send as JSON for API)
    // For SPA, you might want to redirect to a special URL with the token as a query param
    res.redirect(`${process.env.CLIENT_URL}/google-auth-success?token=${token}`);
});

module.exports = router; 