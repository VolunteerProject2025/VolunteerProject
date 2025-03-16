const express = require('express');
const { googleAuth, normalLogin, register,verifyEmail, logout, chooseRole, getCurrentUser,changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const {authenticateToken} = require("../middleware/auth");

const router = express.Router();

router.post('/google', googleAuth);
router.post('/login', normalLogin);
router.post('/register', register);
router.get('/verify_email', verifyEmail);
router.post('/logout',logout);
router.post('/role',authenticateToken, chooseRole);
router.get('/me',authenticateToken, getCurrentUser);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);

router.post("/change-password", authenticateToken, changePassword);

module.exports = router;
