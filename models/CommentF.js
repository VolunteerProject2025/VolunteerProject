const mongoose = require("mongoose");

const commentfSchema = new mongoose.Schema({
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: "Thread" },
    content: String,
    author: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorAvatar: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "CommentF", default: null },
    isModerator: Boolean,
    isBestAnswer: Boolean,
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("CommentF", commentfSchema);