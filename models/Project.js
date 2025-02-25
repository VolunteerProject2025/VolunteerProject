const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: {type: Date, required: true },
    endDate: {type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Completed'], default: 'Pending' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    volunteer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }]
});

module.exports = mongoose.model('Project', ProjectSchema);
