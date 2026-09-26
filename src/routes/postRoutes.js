const express = require('express');
const authenticateToken = require('../middleware/authenticate');
const { optionalAuthenticate } = require('../middleware/authenticate');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

const router = express.Router();

router.get('/', optionalAuthenticate, postController.list);
router.post('/', authenticateToken, postController.create);
router.get('/:id', postController.getById);
router.put('/:id', authenticateToken, postController.update);
router.delete('/:id', authenticateToken, postController.remove);

router.get('/:postId/comments', optionalAuthenticate, commentController.list);
router.post('/:postId/comments', authenticateToken, commentController.create);
router.post('/:postId/like', authenticateToken, likeController.like);
router.delete('/:postId/unlike', authenticateToken, likeController.unlike);

module.exports = router;
