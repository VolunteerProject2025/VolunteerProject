const express = require('express');
const notificateController = require('../controllers/notificateController');
const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.get('/',authenticateToken, notificateController.getUserNotifications);
router.patch('/:notificationId/read',authenticateToken, notificateController.markNotificationAsRead);

module.exports = router;
