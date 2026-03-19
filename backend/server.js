require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const tradeRoutes = require('./routes/trades');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allows large CSV payloads

// API Routes
app.use('/api/trades', tradeRoutes);
app.use('/api/auth', authRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tradeint-global';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas (Tradeint Global DB)');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
