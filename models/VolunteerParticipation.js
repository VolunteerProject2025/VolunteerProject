const mongoose = require('mongoose');

const VolunteerParticipationSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' }
});

module.exports = mongoose.model('VolunteerParticipation', VolunteerParticipationSchema);
