const express = require('express');
const volunteerRoutes = require('./volunteerRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const organizationRoutes = require('./organizationRoutes');
const projectRoutes = require('./projectRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const upload = require('../middleware/upload');

const router = express.Router();

// Định tuyến các route
router.use('/volunteers', volunteerRoutes);
router.use('/auth', authRoutes);
router.use('/post', postRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/projects',upload.single("image"), projectRoutes);
router.use('/organizations', organizationRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/users', userRoutes);

module.exports = router;
