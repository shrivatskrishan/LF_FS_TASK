const express = require('express');
const authenticateToken = require('../middleware/authenticate');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

const router = express.Router();

router.post('/:id/like', authenticateToken, likeController.likeComment);
router.delete('/:id/unlike', authenticateToken, likeController.unlikeComment);
router.delete('/:id', authenticateToken, commentController.remove);

module.exports = router;
