const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Thời gian bắt đầu (HH:mm)
    endTime: { type: String, required: true },   // Thời gian kết thúc (HH:mm)
    description: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "In Progress", "Completed"], 
        default: "Pending" 
    }, // Trạng thái lịch trình
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);