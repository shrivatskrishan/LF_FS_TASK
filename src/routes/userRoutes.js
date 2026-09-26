const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', userController.list);
router.post('/', authController.register);
router.get('/:id', userController.getById);

module.exports = router;
