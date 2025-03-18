require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { Server } = require('socket.io');
const http = require("http");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use(
    cors({
        origin: `${process.env.FRONT_END_URL}`, // Change this to your frontend URL
        credentials: true, // Allows cookies to be sent from frontend
    })
);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

const io = new Server(server, {
    cors: {
        origin: `${process.env.FRONT_END_URL}`, // Replace with your frontend URL
        methods: ["GET", "POST"],
        credentials: true // Allow credentials (cookies, authorization headers, etc.)
    }
});

// Routes
// const authRoutes = require('../routes/authRoutes');
// const orgRoutes = require('../routes/orgRoutes');
// app.use('/auth', authRoutes);
// app.use('/org', orgRoutes);

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("addNewUser", (userId) => {
        // Only add user if not already in the array
        if (!onlineUsers.some((user) => user.userId === userId)) {
            onlineUsers.push({
                userId,
                socketId: socket.id
            });
        }
        io.emit('getOnlineUsers', onlineUsers);
    });
    
    // Send message - Fixed typo in recipientId
    socket.on('sendMessage', (message) => {
        const user = onlineUsers.find(
            (user) => user.userId === message.recipientId
        );
        
        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            
        }
    });
    
    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit('getOnlineUsers', onlineUsers);
    });
});

module.exports = { app, server, io };