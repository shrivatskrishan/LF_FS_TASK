const { Like, Post, Comment } = require('../models');
const AppError = require('../utils/AppError');
const parseId = require('../utils/parseId');

async function findPostLike(userId, postId) {
    return Like.findOne({
        where: {
            user_id: userId,
            post_id: postId,
            comment_id: null
        }
    });
}

async function likePost(rawPostId, userId) {
    const postId = parseId(rawPostId, 'post id');
    const post = await Post.findByPk(postId);

    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    const existingLike = await findPostLike(userId, postId);
    if (existingLike) {
        throw new AppError('Already liked', 409, 'CONFLICT');
    }

    await Like.create({
        user_id: userId,
        post_id: postId
    });
    await post.increment('likes_count');

    return { message: 'Post liked' };
}

async function unlikePost(rawPostId, userId) {
    const postId = parseId(rawPostId, 'post id');
    const post = await Post.findByPk(postId);

    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    const like = await findPostLike(userId, postId);
    if (!like) {
        throw new AppError('Like not found', 404, 'NOT_FOUND');
    }

    await like.destroy();
    if (post.likes_count > 0) {
        await post.decrement('likes_count');
    }

    return { message: 'Post unliked' };
}

async function findCommentLike(userId, commentId) {
    return Like.findOne({
        where: {
            user_id: userId,
            comment_id: commentId
        }
    });
}

async function likeComment(rawCommentId, userId) {
    const commentId = parseId(rawCommentId, 'comment id');
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404, 'NOT_FOUND');
    }

    const existingLike = await findCommentLike(userId, commentId);
    if (existingLike) {
        throw new AppError('Already liked', 409, 'CONFLICT');
    }

    await Like.create({
        user_id: userId,
        post_id: comment.post_id,
        comment_id: commentId
    });
    await comment.increment('likes_count');

    return { message: 'Comment liked' };
}

async function unlikeComment(rawCommentId, userId) {
    const commentId = parseId(rawCommentId, 'comment id');
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404, 'NOT_FOUND');
    }

    const like = await findCommentLike(userId, commentId);
    if (!like) {
        throw new AppError('Like not found', 404, 'NOT_FOUND');
    }

    await like.destroy();
    if (comment.likes_count > 0) {
        await comment.decrement('likes_count');
    }

    return { message: 'Comment unliked' };
}

module.exports = { likePost, unlikePost, likeComment, unlikeComment };
