const CommentF = require("../models/CommentF");
const Thread = require("../models/Thread");
const mongoose = require("mongoose");
const { toggleLikeDislike } = require("../utils/likeDislikeHelper");
const User = require("../models/User");

// 📌 Get all comments for a thread
exports.getCommentsByThread = async (req, res) => {
  try {
    const comments = await CommentF.find({ threadId: req.params.threadId })
      .sort({ createdAt: 1 })
      .populate("authorId", "fullName img_profile")
      .lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Create a new comment
exports.createComment = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (!user.userId || !mongoose.Types.ObjectId.isValid(user.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { content, threadId, parentId } = req.body;
    if (!content || !threadId) {
      return res.status(400).json({ message: "Content and threadId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return res.status(400).json({ message: "Invalid threadId format" });
    }
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parentId format" });
      }
      const parentComment = await CommentF.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const newComment = new CommentF({
      content,
      threadId,
      parentId: parentId || null,
      author: user.fullName,
      authorId: user.userId,
      authorAvatar: user.img_profile || null,
      isModerator: user.isModerator || false,
      isBestAnswer: false,
      likedBy: [],
      dislikedBy: [],
    });

    await newComment.save();

    await Thread.findByIdAndUpdate(threadId, { $inc: { replies: 1 }, updatedAt: new Date() });

    const populatedComment = await CommentF.findById(newComment._id)
      .populate("authorId", "fullName img_profile")
      .lean();

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 📌 Like a comment
exports.likeComment = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Unauthorized - No user ID" });
    }
    const comment = await CommentF.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.userId;
    await toggleLikeDislike(comment, userId.toString(), "like");
    const updatedComment = await CommentF.findById(req.params.id);
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Dislike a comment
exports.dislikeComment = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Unauthorized - No user ID" });
    }
    const comment = await CommentF.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.userId;
    await toggleLikeDislike(comment, userId.toString(), "dislike");
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
