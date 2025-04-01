const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },

    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { 
        type: String, 
        unique: true,
        validate: {
            validator: function(v) {
                return v === null || v === undefined || v.length > 0; 
            },
            message: "Phone must not be empty"
        },
        sparse: true
    },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    interest: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    
    availableDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    availableHours: [{ type: String, enum: ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night'] }],

    location: { type: String }, 
    willingToTravel: { type: Boolean, default: false },

    bio: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);