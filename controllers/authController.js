
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const generateToken = require('../utils/jwt');

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'postmessage'
);
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Google OAuth Login
exports.googleAuth = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Missing authorization code' });
        }
        const { tokens } = await oAuth2Client.getToken(code);

        // Make sure id_token exists and is a string
        if (!tokens.id_token || typeof tokens.id_token !== 'string') {
            return res.status(400).json({ error: 'Invalid ID token received from Google' });
        }
        // Exchange the code for tokens
        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                googleId,
                fullName: payload.name,
                email: payload.email,
                is_verified: true
            });
            await user.save();
        }
        const token = generateToken(user);
        req.session.user = {
            id: user._id,
            email: user.email,
            role: user.role, // Ensure `role` exists in your User model
        };
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,     // Ensures it's sent over HTTPS (set to false for local dev)
            sameSite: "Strict", // Prevents CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// Normal Email/Password Login
exports.normalLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email' });
        }
        if (!user.is_verified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid  password' });
        }

        const token = generateToken(user);
        req.session.user = {
            id: user._id,
            email: user.email,
            role: user.role, // Ensure `role` exists in your User model
        };
        res.cookie("token", token, {
            httpOnly: true,   // Prevents JavaScript access
            secure: true,     // Ensures it's sent over HTTPS (set to false for local dev)
            sameSite: "Strict", // Prevents CSRF attacks
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }


};
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.BACK_END_URL}/auth/verify_email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email and sign in.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
// User Registration
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user but set "verified" to false
        user = new User({
            fullName,
            email,
            password: hashedPassword,

            is_verfied: false, // Add this field in your User model
        });

        await user.save();

        // Generate a verification token
        const verificationToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: "User registered. Check your email for verification." });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Email Verification Endpoint
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ error: "Invalid token" });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.is_verified = true;
        await user.save();

        res.redirect(`${process.env.FRONT_END_URL}`)
    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).json({ error: "Invalid or expired token" });
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
            res.json({ message: "Logged out successfully" });
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

exports.chooseRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user_find = req.session.user;

        const user = await User.findByIdAndUpdate(user_find.id,
            { role }
        )
        req.session.user = {
            id: user._id,
            email: user.email,
            role: user.role, // Ensure `role` exists in your User model
        };
        res.status(200).json({ message: 'Role updated successfully', user: req.session.user });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Choose Role failed' });
    }

}