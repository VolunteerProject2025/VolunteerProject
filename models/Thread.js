const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    author: String,
    authorAvatar: String,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    isPinned: { type: Boolean, default: false },
    isSolved: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: { type: Number, default: 0 }
  }, { timestamps: true }
);

module.exports = mongoose.model("Thread", threadSchema);
