const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const commentService = require('../services/commentService');

const list = asyncHandler(async (req, res) => {
    const comments = await commentService.listByPost(req.params.postId, req.user?.id);
    sendSuccess(res, { message: 'Comments fetched', data: comments });
});

const create = asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(req.params.postId, req.user.id, req.body.content);
    sendSuccess(res, { status: 201, message: 'Comment created', data: comment });
});

const remove = asyncHandler(async (req, res) => {
    const result = await commentService.deleteComment(req.params.id, req.user.id);
    sendSuccess(res, { message: result.message, data: result });
});

module.exports = { list, create, remove };
