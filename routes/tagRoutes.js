const express = require("express");
const router = express.Router();
const tagController = require("../controllers/TagController");

router.get("/", tagController.getAllTags);
router.post("/", tagController.createTag);

module.exports = router;