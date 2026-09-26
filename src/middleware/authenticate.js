const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function authenticateToken(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(new AppError('Access token required', 401, 'UNAUTHORIZED'));
    }

    if (!process.env.JWT_SECRET) {
        return next(new AppError('Authentication is not configured', 500, 'AUTH_NOT_CONFIGURED'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id };
        next();
    } catch (err) {
        next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
    }
}

function optionalAuthenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) {
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.id };
    } catch (err) {
        return next();
    }

    next();
}

module.exports = authenticateToken;
module.exports.optionalAuthenticate = optionalAuthenticate;
