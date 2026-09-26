const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const likeService = require('../services/likeService');

const like = asyncHandler(async (req, res) => {
    const result = await likeService.likePost(req.params.postId, req.user.id);
    sendSuccess(res, { status: 201, message: result.message, data: result });
});

const unlike = asyncHandler(async (req, res) => {
    const result = await likeService.unlikePost(req.params.postId, req.user.id);
    sendSuccess(res, { message: result.message, data: result });
});

const likeComment = asyncHandler(async (req, res) => {
    const result = await likeService.likeComment(req.params.id, req.user.id);
    sendSuccess(res, { status: 201, message: result.message, data: result });
});

const unlikeComment = asyncHandler(async (req, res) => {
    const result = await likeService.unlikeComment(req.params.id, req.user.id);
    sendSuccess(res, { message: result.message, data: result });
});

module.exports = { like, unlike, likeComment, unlikeComment };
