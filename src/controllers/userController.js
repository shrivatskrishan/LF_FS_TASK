const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const userService = require('../services/userService');

const list = asyncHandler(async (req, res) => {
    const users = await userService.listUsers();
    sendSuccess(res, { message: 'Users fetched', data: users });
});

const getById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, { message: 'User fetched', data: user });
});

module.exports = { list, getById };
