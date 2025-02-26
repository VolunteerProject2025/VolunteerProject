const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Route để lấy thông tin tình nguyện viên
router.get('/', UserController.getAllUsers);
router.put('/:userId/in-active', UserController.inActiveAccount);

module.exports = router;
