const express = require('express');
const VolunteerController = require('../controllers/VolunteerController');

const router = express.Router();

// Route để lấy thông tin tình nguyện viên
router.get('/:volunteerId', VolunteerController.getVolunteerDetails);

module.exports = router;
