const express = require('express');
const VolunteerController = require('../controllers/VolunteerController');
const { authenticateToken } = require("../middleware/auth"); // Kiểm tra đăng nhập
const upload = require('../middleware/upload');

const router = express.Router();

// Lấy danh sách tất cả tình nguyện viên
router.get('/', VolunteerController.getAllVolunteer);

// Lấy thông tin tình nguyện viên hiện tại (từ token)
router.get('/me', authenticateToken, VolunteerController.getCurrentVolunteer);

// Lấy thông tin chi tiết của một tình nguyện viên theo ID
router.get('/:volunteerId', VolunteerController.getVolunteerDetails);

// Cập nhật hồ sơ tình nguyện viên (yêu cầu xác thực)
router.put('/me', authenticateToken,upload.single('profileImage'), VolunteerController.updateProfile);

module.exports = router;