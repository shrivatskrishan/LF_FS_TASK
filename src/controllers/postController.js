const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const postService = require('../services/postService');

const list = asyncHandler(async (req, res) => {
    const feed = await postService.listFeed(req.user?.id);
    sendSuccess(res, {
        message: 'Posts fetched',
        data: feed,
        meta: { count: feed.posts.length }
    });
});

const getById = asyncHandler(async (req, res) => {
    const post = await postService.getPostById(req.params.id);
    sendSuccess(res, { message: 'Post fetched', data: post });
});

const create = asyncHandler(async (req, res) => {
    const post = await postService.createPost(req.user.id, req.body);
    sendSuccess(res, { status: 201, message: 'Post created', data: post });
});

const update = asyncHandler(async (req, res) => {
    const result = await postService.updatePost(req.params.id, req.user.id, req.body);
    sendSuccess(res, { message: result.message, data: result });
});

const remove = asyncHandler(async (req, res) => {
    const result = await postService.deletePost(req.params.id, req.user.id);
    sendSuccess(res, { message: result.message, data: result });
});

const trending = asyncHandler(async (req, res) => {
    const posts = await postService.listTrending(req.user?.id);
    sendSuccess(res, { message: 'Trending posts fetched', data: posts });
});

const search = asyncHandler(async (req, res) => {
    const posts = await postService.searchPosts(req.query.q, req.user?.id);
    sendSuccess(res, { message: 'Search results', data: posts });
});

module.exports = { list, getById, create, update, remove, trending, search };
