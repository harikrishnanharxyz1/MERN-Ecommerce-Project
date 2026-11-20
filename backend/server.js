const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');
const offerRoutes = require('./routes/offerRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const getJwtSecret = require('./utils/jwtSecret');

const app = express();
getJwtSecret();

// Connect to MongoDB Database
connectDB();

// CORS Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '7mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static product images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/offers', offerRoutes);

// Health check / root route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fastbuy API is up and running' });
});

app.get('/', (req, res) => {
  res.send('Fastbuy E-commerce Backend API is Running!');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
