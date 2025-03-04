const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    img_profile: { type: String, default: null },

    name: { type: String, required: true },
    description: { type: String, required: true },
    contactEmail: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    address: { type: String },
    phone: { type: Number, required: true, unique: true }, 
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },

}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);
