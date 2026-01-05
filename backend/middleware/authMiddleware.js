// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const jwtSecret = config.jwtSecret;
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret);
            req.user = { userId: decoded.userId, email: decoded.email };
            return next(); // CRITICAL FIX: Return after calling next()
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    // Only reaches here if no Bearer token was found
    return res.status(401).json({ message: 'Not authorized, no token.' });
};
module.exports = { protect };