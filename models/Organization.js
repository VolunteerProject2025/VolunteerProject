const mongoose = require('mongoose');
const OrganizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
   
    org_profile : {type: String},
    name: { type: String, },
    description: { type: String },
    contactEmail: { type: String, },
    address: { type: String, },
    phone: { type: Number, },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });


module.exports = mongoose.model('Organization', OrganizationSchema);
