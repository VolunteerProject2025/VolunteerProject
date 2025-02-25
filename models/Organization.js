const mongoose = require('mongoose');
const OrganizationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  name: { type: String, required: true },
  description: { type: String },
  contactEmail: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: Number, required: true, min: 10, max: 12 },
}, { timestamps: true });


module.exports = mongoose.model('Organization', OrganizationSchema);