const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const commentRoutes = require('./commentRoutes');
const postController = require('../controllers/postController');
const { optionalAuthenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.get('/trending', optionalAuthenticate, postController.trending);
router.get('/search', optionalAuthenticate, postController.search);

module.exports = router;
