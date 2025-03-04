const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
