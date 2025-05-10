const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat'},
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    text: String
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
