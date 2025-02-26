const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  fullName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ["Volunteer", "Guest", "Organization", "Admin"] },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  is_verified: { type: Boolean, default: false },

}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);