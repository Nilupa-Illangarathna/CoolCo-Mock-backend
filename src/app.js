const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

// 404 catch-all
app.use((_req, res) => res.json({ is_success: false, message: 'Route not found' }));

module.exports = app;
