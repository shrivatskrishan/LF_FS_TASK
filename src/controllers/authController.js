const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    sendSuccess(res, { status: 201, message: 'User created', data: user });
});

const login = asyncHandler(async (req, res) => {
    const session = await authService.login(req.body);
    sendSuccess(res, { message: 'Login successful', data: session });
});

const me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, { message: 'Current user', data: user });
});

module.exports = { register, login, me };
