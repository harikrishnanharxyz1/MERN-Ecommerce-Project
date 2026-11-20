const mongoose = require('mongoose');
const ensureAdmin = require('./ensureAdmin');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Ensure default admin user exists
    await ensureAdmin();
  } catch (error) {
    console.error('MongoDB connection failed; check MONGO_URI and database availability.');
    // Do not terminate process in dev so server can still serve health check
    // if MongoDB is not started yet or URI is pending configuration
  }
};

module.exports = connectDB;
