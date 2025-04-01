const express = require("express");
const router = express.Router();
const threadController = require("../controllers/ThreadController");
const { authenticateToken } = require("../middleware/auth");

router.get("/", threadController.getThreads);
router.get("/:id", threadController.getThreadById);
router.post("/", authenticateToken, threadController.createThread);
router.post("/:id/like", authenticateToken, threadController.likeThread);
router.post("/:id/dislike", authenticateToken, threadController.dislikeThread);

module.exports = router;
