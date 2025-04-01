// Post.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    relativeTime: { type: String } 
});

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Danh sách user thích bài viết
    comments: [CommentSchema], // Danh sách comment
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    trashed: { type: Boolean, default: false } // Thêm trường trashed để xác định bài viết đã bị xóa
});

module.exports = mongoose.model('Post', PostSchema);