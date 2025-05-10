const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const organizationRoutes = require('./organizationRoutes');
const projectRoutes = require('./projectRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('../routes/authRoutes');
const notificationRoutes = require('../routes/notificationRoutes');
const chatRoutes = require('../routes/chatRoutes');
const messageRoutes = require('../routes/messageRoutes');
const skillRoutes = require('./skillRoutes');
const router = express.Router();
const upload = require('../middleware/upload');

// Định tuyến các route
router.use('/auth', authRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/message', messageRoutes);

router.use('/volunteers', volunteerRoutes);
router.use('/post', postRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/projects',upload.single('image'), projectRoutes);
router.use('/organizations', organizationRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);
module.exports = router;
