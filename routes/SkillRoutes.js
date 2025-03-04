const express = require('express');
const router = express.Router();
const skillController = require('../controllers/SkillController');

router.post('/', skillController.createSkill);

router.get('/', skillController.getSkills);

router.put('/:id', skillController.updateSkill);

router.delete('/:id', skillController.deleteSkill);

module.exports = router;
