const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const publicUser = {
    attributes: { exclude: ['password_hash'] }
};

async function register({ username, email, password, bio }) {
    if (!username || !email || !password) {
        throw new AppError('Username, email, and password required', 400, 'VALIDATION_ERROR');
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
        throw new AppError('Email already registered', 409, 'CONFLICT');
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
        throw new AppError('Username already taken', 409, 'CONFLICT');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password_hash: passwordHash,
        bio: bio || ''
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email
    };
}

async function login({ email, password }) {
    if (!email || !password) {
        throw new AppError('Email and password required', 400, 'VALIDATION_ERROR');
    }

    if (!process.env.JWT_SECRET) {
        throw new AppError('Authentication is not configured', 500, 'AUTH_NOT_CONFIGURED');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    let matches = false;
    try {
        matches = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
        matches = false;
    }

    if (!matches) {
        throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    };
}

async function getCurrentUser(userId) {
    const user = await User.findByPk(userId, publicUser);
    if (!user) {
        throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }
    return user;
}

module.exports = { register, login, getCurrentUser };
