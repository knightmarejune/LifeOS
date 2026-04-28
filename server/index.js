require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
let serviceAccount;
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountEnv) {
  try {
    serviceAccount = JSON.parse(serviceAccountEnv);
  } catch (e) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_JSON env var');
  }
} else {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
  try {
    serviceAccount = require(path.resolve(__dirname, serviceAccountPath));
  } catch (e) {
    // fallback handled below
  }
}

if (serviceAccount) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized');
    }
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error.message);
  }
} else {
  console.warn('⚠️  No Firebase Service Account found. Backend auth will fail.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (like mobile apps or curl) or if it matches our list
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o)) || 
                      origin.endsWith('.vercel.app'); // Flexible for Vercel

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
