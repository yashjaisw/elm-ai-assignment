const { createClient } = require('redis');

let redisClient = null;

const initRedis = async () => {
  try {
    // Only initialize Redis if URL is provided
    // This makes it optional for development
    if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'production') {
      console.log(' Redis URL not provided. Skipping Redis initialization (development mode)');
      return;
    }

    const redisConfig = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_unfulfilled_commands: true,
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff with max delay of 3 seconds
          const delay = Math.min(retries * 50, 3000);
          console.log(` Redis reconnecting in ${delay}ms...`);
          return delay;
        }
      }
    };

    redisClient = createClient(redisConfig);

    // Event handlers for monitoring Redis connection
    redisClient.on('error', (err) => {
      console.error(' Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Connection Ended');
    });

    // Connect to Redis
    await redisClient.connect();
    console.log(' Redis initialized successfully');

  } catch (error) {
    console.error(' Redis initialization failed:', error.message);
    
    // In development, we can continue without Redis
    if (process.env.NODE_ENV !== 'production') {
      console.log(' Continuing without Redis in development mode');
      redisClient = null;
    } else {
      // In production, Redis might be critical
      throw error;
    }
  }
};

// Helper functions for caching
const getFromCache = async (key) => {
  if (!redisClient) return null;
  
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(' Redis GET error:', error);
    return null;
  }
};

const setCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(' Redis SET error:', error);
    return false;
  }
};

const deleteFromCache = async (key) => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(' Redis DELETE error:', error);
    return false;
  }
};

// Graceful shutdown
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log(' Redis connection closed');
    } catch (error) {
      console.error(' Error closing Redis connection:', error);
    }
  }
};

process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);

module.exports = {
  initRedis,
  getFromCache,
  setCache,
  deleteFromCache,
  getClient: () => redisClient
};