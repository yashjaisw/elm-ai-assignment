const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options for production-ready setup
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Temporary hardcoded URL for testing
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://yash:yash@cluster0.q0xpy5d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI);

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    // Don't exit in development, but log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;