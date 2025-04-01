// filepath: /d:/VolunteerProject/controllers/ScheduleController.js
const Schedule = require('../models/Schedule');
const Project = require('../models/Project');

// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        if (!req.body.project) {
            return res.status(400).json({ message: "Project ID is required" });
        }

        const schedule = new Schedule(req.body);
        console.log(req.body);  
        await schedule.save();
        res.status(201).json(schedule);
    } catch (error) {
        console.error("Schedule creation error:", error);
        // res.status(400).json({ message: error.message });
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