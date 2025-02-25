const mongoose = require('mongoose');
const OrganizationSchema = new mongoose.Schema({
  name: String,
  description: {type:String, default: null},
  
  contactEmail: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ["Volunteer", "Organization", "Admin"] },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  is_verified: { type: Boolean, default: false },

}, { timestamps: true });


module.exports = mongoose.model('Organization', OrganizationSchema);