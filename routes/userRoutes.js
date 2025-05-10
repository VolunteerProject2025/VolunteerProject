const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Route để lấy thông tin tình nguyện viên
router.get('/', UserController.getAllUsers);
router.get('/find/:userId', UserController.findUserById);
router.put('/:userId/in-active', UserController.inActiveAccount);
router.put('/:userId/active', UserController.activeAccount);
router.get("/search", UserController.searchUsers);
module.exports = router;
