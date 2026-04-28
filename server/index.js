require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(path.resolve(__dirname, serviceAccountPath)))
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin init error:', error.message);
  console.warn('⚠️  Please ensure you have a Firebase Service Account JSON at the specified path.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI || mongoURI.includes('<CLUSTER_ADDRESS>')) {
  console.warn('\n⚠️  WARNING: MONGODB_URI is not fully configured.');
  console.warn('Please update the <CLUSTER_ADDRESS> in server/.env with your MongoDB host.\n');
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Ensure your IP is whitelisted and credentials are correct.');
  });

// Routes
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/journal', require('./routes/journal'));

// Basic Route
app.get('/', (req, res) => {
  res.send('LifeOS API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
