// filepath: /d:/VolunteerProject/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/ScheduleController');

router.post('/project/:projectId/schedules', scheduleController.createSchedule);

router.get('/project/:projectId', scheduleController.getSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;