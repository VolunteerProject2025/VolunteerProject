const express = require("express");
const router = express.Router();
const commentController = require("../controllers/CommentFController");
const { authenticateToken } = require("../middleware/auth");

router.get("/:threadId", commentController.getCommentsByThread);
router.post("/", authenticateToken, commentController.createComment);
router.post("/:id/like", authenticateToken, commentController.likeComment);
router.post("/:id/dislike", authenticateToken, commentController.dislikeComment);

module.exports = router;
