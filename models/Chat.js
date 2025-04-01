const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    isGroupChat : { type: Boolean, default: false },
    name : String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin : String
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
