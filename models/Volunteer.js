const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);