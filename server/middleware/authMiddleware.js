const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - checks for a valid token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user to the request, but exclude the password
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based access - checks if user is an employer
const employer = (req, res, next) => {
    if (req.user && req.user.role === 'employer') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an employer' });
    }
};

module.exports = { protect, employer };