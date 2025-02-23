require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./config/app');
const authRoutes = require('./routes/authRoutes')


// Connect to MongoDB
connectDB();
console.log();

// Routes
app.use('/auth', authRoutes);
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}` );
});
