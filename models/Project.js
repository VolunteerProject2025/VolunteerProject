const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    categories: { type: String },
    image: { type: String },
    startDate: {type: Date, required: true },
    endDate: {type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Completed','Rejected'], default: 'Pending' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    volunteer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
    volunteerNumber: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);



