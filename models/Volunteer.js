const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },

    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true, unique: true },
    
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    interest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    
    availableDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    availableHours: [{ type: String, enum: ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night'] }],

    location: { type: String, required: true }, 
    willingToTravel: { type: Boolean, default: false },

    bio: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
