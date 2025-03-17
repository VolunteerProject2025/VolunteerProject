// filepath: /d:/VolunteerProject/controllers/ScheduleController.js
const Schedule = require('../models/Schedule');
const Project = require('../models/Project');

// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        const { project, startTime, endTime } = req.body;
        if (!project) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        const projectData = await Project.findById(project);
        if (!projectData) {
            return res.status(404).json({ message: "Project not found" });
        }

        const projectStart = new Date(projectData.startDate);
        const projectEnd = new Date(projectData.endDate);
        const scheduleStart = new Date(startTime);
        const scheduleEnd = new Date(endTime);

        // Check if the schedule is within the project's time frame
        if (scheduleStart < projectStart || scheduleEnd > projectEnd) {
            return res.status(400).json({ 
                message: `Schedule time must be between ${projectStart.toISOString()} and ${projectEnd.toISOString()}` 
            });
        }

        const schedule = new Schedule(req.body);
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        console.error("Schedule creation error:", error);
        res.status(400).json({ message: error.message });
    }
};


// Get all schedules for a project
exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({ project: req.params.projectId });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single schedule by ID
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a schedule by ID
exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json(schedule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a schedule by ID
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// // ✅ Hàm lấy danh sách schedule theo projectId
// exports.getScheduleByProjectId = async (req, res) => {
//   try {
//     const { projectId } = req.params; // Lấy projectId từ params
//     if (!projectId) {
//       return res.status(400).json({ message: "Project ID is required" });
//     }

//     const schedules = await Schedule.find({ project: projectId }).sort("date startTime");
    
//     res.json({ schedules });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching schedules", error: error.message });
//   }
// };
