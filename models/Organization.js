const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    name: { type: String, required: true },
    description: { type: String },
    contactEmail: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
