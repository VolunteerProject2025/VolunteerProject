
require('dotenv').config();
const bodyParser = require('body-parser');
const routes = require('./routes');
const connectDB = require('./config/db');
const app = require('./config/app');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();
console.log();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', routes);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
