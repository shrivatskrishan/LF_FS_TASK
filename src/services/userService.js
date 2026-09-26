const { User, Post, Comment } = require('../models');
const AppError = require('../utils/AppError');
const parseId = require('../utils/parseId');

const publicUser = {
    attributes: { exclude: ['password_hash'] }
};

async function listUsers() {
    return User.findAll({
        ...publicUser,
        limit: 100
    });
}

async function getUserById(rawId) {
    const id = parseId(rawId, 'user id');
    const user = await User.findByPk(id, {
        ...publicUser,
        include: [
            { model: Post, as: 'posts', attributes: ['id'] },
            { model: Comment, as: 'comments', attributes: ['id'] }
        ]
    });

    if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const postsCount = await Post.count({ where: { user_id: user.id } });
    const commentsCount = await Comment.count({ where: { user_id: user.id } });
    const postsLikes = await Post.sum('likes_count', { where: { user_id: user.id } });

    return {
        ...user.toJSON(),
        total_posts: postsCount,
        total_comments: commentsCount,
        total_post_likes: postsLikes || 0
    };
}

module.exports = { listUsers, getUserById };
