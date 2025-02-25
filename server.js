require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./config/app');



// Connect to MongoDB
connectDB();
console.log();


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}` );
});
