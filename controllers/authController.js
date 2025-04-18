const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const generateToken = require("../utils/jwt");
const Volunteer = require("../models/Volunteer");
const fs = require('fs');
const path = require('path');
const Organization = require("../models/Organization");

const emailTemplate = fs.readFileSync(path.join('templates', 'emailTemplate.html'), 'utf8');
const passwordTemplate = fs.readFileSync(path.join('templates', 'passwordTemplate.html'), 'utf8');
const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return strongPasswordRegex.test(password);
};
const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
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
            return res.status(400).json({ error: "Missing authorization code" });
        }

      

        const { tokens } = await oAuth2Client.getToken(code);
        if (!tokens.id_token || typeof tokens.id_token !== "string") {
            return res.status(400).json({ error: "Invalid ID token received from Google" });
        }

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let user = await User.findOne({ email: payload.email });
        if (user) {
            // If user exists but does not have Google ID, update it
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

                    
        } else {
            // Create new user if not found
            const hashedPassword = await bcrypt.hash("123", 10);
            user = new User({
                googleId,
                fullName: payload.name,
                email: payload.email,
                is_verified: true,
                password: hashedPassword,
                role: 'Guest' // Set the selected role for new users
            });
            await user.save();
        }
        const organization = await Organization.findOne({user :user._id})
        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Login successful", user,organization });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
};

// Normal Email/Password Login
    exports.normalLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: "Invalid email" });
            }

            if (!user.is_verified) {
                return res.status(403).json({ message: "Please verify your email before logging in." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid password" });
            }
            const organization = await Organization.findOne({user :user._id})

            const token = generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.json({ message: "Login successful", user,organization });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: "Authentication failed" });
        }
    };

// Send Email Verification
const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.BACK_END_URL}/auth/verify_email?token=${token}`;

    const emailHTML = emailTemplate.replace(/{{action_url}}/g, verificationLink);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email - Volunteer Connection",
        html: emailHTML,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (!isStrongPassword(password)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character (!@#$%^&*)" 
            });
        }
        // Validate role
        if (!["Volunteer", "Organization"].includes(role)) {
            return res.status(400).json({ error: "Invalid role selected" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create verification token

        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role, // Set the selected role
            is_verified: false
        });

        await newUser.save();

        // Save verification token
       


        // Send verification email
        const verificationToken = generateToken(newUser);
        await sendVerificationEmail(email, verificationToken);;

        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
};
// User Registration
// exports.register = async (req, res) => {
//     try {
//         const { fullName, email, password } = req.body;
//         console.log(fullName, email, password);

//         // Check password strength
//         if (!isStrongPassword(password)) {
//             return res.status(400).json({ 
//                 error: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character (!@#$%^&*)" 
//             });
//         }

//         let user = await User.findOne({ email });
//         console.log(user);
//         if (user) {
//             return res.status(400).json({ error: "Email already exists" });
//         }
//         console.log("aaaa", user);
        
//         const hashedPassword = await bcrypt.hash(password, 10);
//         user = new User({
//             fullName,
//             email,
//             password: hashedPassword,
//             is_verified: false,
//         });
//         console.log("uset;", user);

//         await user.save();

//         const verificationToken = generateToken(user);
//         await sendVerificationEmail(email, verificationToken);

//         res.status(201).json({ message: "User registered. Check your email for verification." });
//     } catch (error) {
//         console.error("Registration Error:", error);
//         res.status(500).json({ error: "Registration failed" });
//     }
// };

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

        res.redirect(`${process.env.FRONT_END_URL}/#/login`);
    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).json({ error: "Invalid or expired token" });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "Strict" });
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Logout failed" });
    }
};

// Choose Role
exports.chooseRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user_find = req.user; // Extract user from the decoded JWT

        const user = await User.findByIdAndUpdate(user_find.userId, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        if(user.role=="Volunteer"){
            const volunteer = new Volunteer({
                user: user_find.userId,
                email: user.email
            })
            await volunteer.save()
        } 

        // Store token in secure cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
        console.error("Choose Role Error:", error);
        res.status(500).json({ error: "Choose Role failed" });
    }
};
exports.getCurrentUser = async (req,res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.changePassword = async (req, res) => {
    try {
        // Ensure user is authenticated
        const userId = req.user.userId; 
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All password fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        // Check password strength
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ 
                error: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character (!@#$%^&*)" 
            });
        }

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.password) {
            return res.status(400).json({ message: "Stored password is missing or invalid" });
        }

        // Verify the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password in the database
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
    exports.forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Generate a reset token (expires in 15 minutes)
            const resetToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

            // Create reset link
            const resetLink = `${process.env.FRONT_END_URL}/#/reset-password?token=${resetToken}`;
            const emailHTML = passwordTemplate.replace(/{{action_url}}/g, resetLink);

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Password Reset Request",
                html: emailHTML,
            };

            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: "Reset password email sent" });

        } catch (error) {
            console.error("Forgot Password Error:", error);
            res.status(500).json({ error: "Failed to process request" });
        }
    };

    exports.resetPassword = async (req, res) => {
        try {
            const { token, newPassword, confirmPassword } = req.body;
    
            // Verify inputs
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match" });
            }
    
            // Check password strength
            if (!isStrongPassword(newPassword)) {
                return res.status(400).json({ 
                    error: "Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character (!@#$%^&*)" 
                });
            }
    
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
    
            if (!user) {
                return res.status(400).json({ error: "Invalid or expired token" });
            }
    
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
    
            res.json({ message: "Password reset successfully" });
    
        } catch (error) {
            console.error("Reset Password Error:", error);
            res.status(500).json({ error: "Invalid or expired token" });
        }
    };
    exports.sendSuccessEmail = async (email, name) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
    
            const mailOptions = {
                from: `"VOLUNTEER ACT" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Dự án đã được duyệt thành công",
                html: `
                    <h2>Xin chào ${name},</h2>
                    <p>Chúc mừng! Dự án của bạn đã được xét duyệt thành công.</p>
                    <p>Cảm ơn bạn đã đăng ký!</p>
                    <br/>
                    <p><strong>Trân trọng,</strong></p>
                    <p>Đội ngũ hỗ trợ</p>
                `
            };
    
            await transporter.sendMail(mailOptions);
            console.log(`Email xác nhận đã gửi tới: ${email}`);
        } catch (error) {
            console.error("Lỗi khi gửi email xác nhận:", error);
        }
    };
    exports.sendRejectEmail = async (email, name) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
    
            const mailOptions = {
                from: `"Support Team" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Dự án của bạn đã bị từ chối",
                html: `
                    <h2>Xin chào ${name},</h2>
                    <p>Dự án của bạn đã bị từ chối. Bạn có thể gửi mail đến địa chỉ <strong>volunteerconnection.noreply@gmail.com</strong> để có thể biết thêm thông tin.</p>
                    <p>Cảm ơn bạn !</p>
                    <br/>
                    <p><strong>Trân trọng,</strong></p>
                    <p>Đội ngũ hỗ trợ</p>
                `
            };
    
            await transporter.sendMail(mailOptions);
            console.log(`Email xác nhận đã gửi tới: ${email}`);
        } catch (error) {
            console.error("Lỗi khi gửi email xác nhận:", error);
        }
    };