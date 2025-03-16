const express = require("express");
const Skill = require("../models/Skill");

const router = express.Router();

//Lấy danh sách tất cả kỹ năng
router.get("/", async (req, res) => {
    try {
        const skills = await Skill.find().select("_id name"); // Lấy ID & tên
        res.status(200).json(skills);
    } catch (error) {
        console.error("❌ Error fetching skills:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Thêm mới một kỹ năng
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Skill name is required" });
        }

        const newSkill = new Skill({ name });
        await newSkill.save();
        res.status(201).json({ success: true, skill: newSkill });
    } catch (error) {
        console.error("❌ Error adding skill:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Xóa một kỹ năng theo ID
router.delete("/:id", async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }
        res.status(200).json({ success: true, message: "Skill deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting skill:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
