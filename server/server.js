const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

// ✅ Check for .env file
if (!process.env.MONGO_URI || !process.env.FRONTEND_URL) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

// ✅ Connect to Database
connectDB();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Handle form data
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// ✅ Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
