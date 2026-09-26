const { Op } = require('sequelize');
const { Post, User, Comment, Like } = require('../models');
const AppError = require('../utils/AppError');
const parseId = require('../utils/parseId');

function authorInclude() {
    return {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'profile_picture_url']
    };
}

function commentsInclude() {
    return {
        model: Comment,
        as: 'comments',
        attributes: ['id', 'content', 'likes_count'],
        include: [authorInclude()]
    };
}

function withCommentCount(post) {
    const json = post.toJSON();
    return {
        ...json,
        comment_count: json.comments ? json.comments.length : 0
    };
}

async function withLikedByMe(posts, userId) {
    const commentIds = posts.flatMap((post) => (post.comments || []).map((comment) => comment.id));
    let likedPostIds = new Set();
    let likedCommentIds = new Set();

    if (userId && (posts.length || commentIds.length)) {
        const scopes = [];
        if (posts.length) {
            scopes.push({ post_id: posts.map((post) => post.id), comment_id: null });
        }
        if (commentIds.length) {
            scopes.push({ comment_id: commentIds });
        }

        const likes = await Like.findAll({
            where: { user_id: userId, [Op.or]: scopes },
            attributes: ['post_id', 'comment_id']
        });
        likedPostIds = new Set(likes.filter((like) => like.comment_id == null).map((like) => like.post_id));
        likedCommentIds = new Set(likes.filter((like) => like.comment_id != null).map((like) => like.comment_id));
    }

    return posts.map((post) => ({
        ...post,
        liked_by_me: likedPostIds.has(post.id),
        comments: (post.comments || []).map((comment) => ({
            ...comment,
            liked_by_me: likedCommentIds.has(comment.id)
        }))
    }));
}

function assertOwner(record, userId) {
    if (Number(record.user_id) !== Number(userId)) {
        throw new AppError('Not authorized', 403, 'FORBIDDEN');
    }
}

async function listFeed(userId) {
    const rows = await Post.findAll({
        include: [authorInclude(), commentsInclude()],
        order: [['created_at', 'DESC']]
    });

    return { posts: await withLikedByMe(rows.map(withCommentCount), userId) };
}

async function getPostById(rawId) {
    const id = parseId(rawId, 'post id');
    const post = await Post.findByPk(id, {
        include: [
            authorInclude(),
            {
                model: Comment,
                as: 'comments',
                include: [authorInclude()]
            }
        ]
    });

    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    return post;
}

async function createPost(userId, { title, content, image_url }) {
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanContent = typeof content === 'string' ? content.trim() : '';

    if (!cleanTitle || !cleanContent) {
        throw new AppError('Title and content required', 400, 'VALIDATION_ERROR');
    }

    const post = await Post.create({
        user_id: userId,
        title: cleanTitle,
        content: cleanContent,
        image_url: image_url || null
    });

    return {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        image_url: post.image_url,
        likes_count: post.likes_count,
        createdAt: post.createdAt
    };
}

async function updatePost(rawId, userId, { title, content }) {
    const id = parseId(rawId, 'post id');
    const post = await Post.findByPk(id);

    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    assertOwner(post, userId);

    await post.update({
        title: title || post.title,
        content: content || post.content
    });

    return { message: 'Post updated' };
}

async function deletePost(rawId, userId) {
    const id = parseId(rawId, 'post id');
    const post = await Post.findByPk(id);

    if (!post) {
        throw new AppError('Post not found', 404, 'NOT_FOUND');
    }

    assertOwner(post, userId);
    await post.destroy();
    return { message: 'Post deleted' };
}

async function listTrending(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rows = await Post.findAll({
        where: {
            created_at: { [Op.gte]: sevenDaysAgo }
        },
        include: [authorInclude(), commentsInclude()],
        order: [['likes_count', 'DESC']],
        limit: 20
    });

    return withLikedByMe(rows.map(withCommentCount), userId);
}

async function searchPosts(query, userId) {
    const q = typeof query === 'string' ? query.trim() : '';
    if (!q) {
        throw new AppError('Search query required', 400, 'VALIDATION_ERROR');
    }

    const rows = await Post.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.iLike]: `%${q}%` } },
                { content: { [Op.iLike]: `%${q}%` } }
            ]
        },
        include: [authorInclude(), commentsInclude()],
        order: [['created_at', 'DESC']],
        limit: 20
    });

    return withLikedByMe(rows.map(withCommentCount), userId);
}

module.exports = {
    listFeed,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    listTrending,
    searchPosts
};
