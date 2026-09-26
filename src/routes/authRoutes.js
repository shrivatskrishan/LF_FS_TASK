const express = require('express');
const authenticateToken = require('../middleware/authenticate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
