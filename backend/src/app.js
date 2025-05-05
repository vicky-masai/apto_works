const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const prisma = require('./config/database');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const { encryptPayload, decryptPayload } = require('../src/utils/crypto');
const fileUpload = require('express-fileupload');

const {
  setSocketIO,
  addOnlineUser,
  removeOnlineUser
} = require('./utils/notificationService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());

// Serve static files from uploads directory
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
//   setHeaders: (res, path) => {
//     res.set('Access-Control-Allow-Origin', '*');
//   }
// }));

// Test endpoint for decryption
app.post('/api/test/decrypt', (req, res) => {
  try {
    const encrypted = req.body.encryptedData;
    const data = decryptPayload(encrypted);
    res.json({ message: 'Data decrypted successfully', ...data });
  } catch (error) {
    res.status(400).json({ error: 'Failed to decrypt data', message: error.message });
  }
});

// Test endpoint for encryption
app.post('/api/test/encrypt', (req, res) => {
  try {
    const payload = req.body.payload;
    const encryptedData = encryptPayload(payload);
    res.json({ message: 'Data encrypted successfully', encryptedData });
  } catch (error) {
    res.status(400).json({ error: 'Failed to encrypt data', message: error.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/task-providers', require('./routes/taskProviders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/balance', require('./routes/balance'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/upi', require('./routes/adminUpiRoutes'));
app.use('/api/upload', require('./routes/upload'));
// app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));

app.get('/test', (req, res) => {
  res.json({ message: 'Hello from Vercel!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;