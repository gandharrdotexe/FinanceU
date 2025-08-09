// app.js (UPDATED - Add these lines)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const moduleRoutes = require('./routes/moduleRoute');
const budgetRoutes = require('./routes/budgetRoute');
const gamificationRoutes = require('./routes/gamificationRoute');
const chatRoutes = require('./routes/chatRoute');
const goalRoutes = require('./routes/goalRoute');        
const toolsRoutes = require('./routes/toolsRoute');
const badgeRoutes = require('./routes/badgeRoute');  

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
app.options("*", cors()); 
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/goals', goalRoutes);        
app.use('/api/tools', toolsRoutes);
app.use('/api/badges', badgeRoutes);       

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FinanceU API is healthy! ;)',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;