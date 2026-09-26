const { Comment, Post, User, Like } = require('../models');
const AppError = require('../utils/AppError');
const parseId = require('../utils/parseId');

async function listByPost(rawPostId, userId) {
    const postId = parseId(rawPostId, 'post id');
    const post = await Post.findByPk(postId);
    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    const rows = await Comment.findAll({
        where: { post_id: postId },
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profile_picture_url']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    const comments = rows.map((row) => row.toJSON());
    let likedIds = new Set();

    if (userId && comments.length) {
        const likes = await Like.findAll({
            where: {
                user_id: userId,
                comment_id: comments.map((comment) => comment.id)
            },
            attributes: ['comment_id']
        });
        likedIds = new Set(likes.map((like) => like.comment_id));
    }

    return comments.map((comment) => ({
        ...comment,
        liked_by_me: likedIds.has(comment.id)
    }));
}

async function createComment(rawPostId, userId, content) {
    const postId = parseId(rawPostId, 'post id');
    const cleanContent = typeof content === 'string' ? content.trim() : '';

    if (!cleanContent) {
        throw new AppError('Content required', 400, 'VALIDATION_ERROR');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    const comment = await Comment.create({
        post_id: postId,
        user_id: userId,
        content: cleanContent
    });

    return {
        id: comment.id,
        content: comment.content
    };
}

async function deleteComment(rawId, userId) {
    const id = parseId(rawId, 'comment id');
    const comment = await Comment.findByPk(id);

    if (!comment) {
        throw new AppError('Comment not found', 404, 'NOT_FOUND');
    }

    if (Number(comment.user_id) !== Number(userId)) {
        throw new AppError('Not authorized', 403, 'FORBIDDEN');
    }

    await comment.destroy();
    return { message: 'Comment deleted' };
}

module.exports = { listByPost, createComment, deleteComment };
