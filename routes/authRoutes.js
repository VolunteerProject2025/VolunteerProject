const express = require('express');
const { googleAuth, normalLogin, register,verifyEmail } = require('../controllers/authController');

const router = express.Router();

router.post('/google', googleAuth);
router.post('/login', normalLogin);
router.post('/register', register);
router.get('/verify_email', verifyEmail);


module.exports = router;
