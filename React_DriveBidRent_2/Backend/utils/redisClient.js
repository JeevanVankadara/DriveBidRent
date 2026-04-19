import { createClient } from 'redis';

// Initialize Redis client. It will try connecting to default localhost:6379 unless URL is provided in env
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: false
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
  // We do not throw to avoid crashing the app if Redis is not locally available for the user
});

redisClient.on('connect', () => {
  console.log('Redis client connected successfully');
});

// Since the app uses top-level await and async initialization is fine we connect immediately
(async () => {
  try {
    await redisClient.connect();
  } catch (e) {
    console.log("Failed to connect to redis, caching will be bypassed");
  }
})();

export default redisClient;
