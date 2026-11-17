const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const likeService = require('../services/likeService');
const { User } = require('../models');
const { publish } = require('../realtime/notifications');

async function actorName(userId) {
    const user = await User.findByPk(userId, { attributes: ['username'] });
    return user ? user.username : 'Someone';
}

const like = asyncHandler(async (req, res) => {
    const result = await likeService.likePost(req.params.postId, req.user.id);
    publish({
        type: 'post_liked',
        postId: result.postId,
        title: result.title,
        likesCount: result.likesCount,
        authorId: result.authorId,
        actorId: req.user.id,
        actorName: await actorName(req.user.id),
        liked: true
    });
    sendSuccess(res, { status: 201, message: result.message, data: result });
});

const unlike = asyncHandler(async (req, res) => {
    const result = await likeService.unlikePost(req.params.postId, req.user.id);
    publish({
        type: 'post_unliked',
        postId: result.postId,
        title: result.title,
        likesCount: result.likesCount,
        authorId: result.authorId,
        actorId: req.user.id,
        actorName: await actorName(req.user.id),
        liked: false
    });
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
