require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
    }
});

redis.on('error', (err) => {
    console.error('✗ Redis error:', err.message);
});

async function connectRedis() {
    if (redis.status === 'ready') return true;

    try {
        await redis.connect();
        console.log('✓ Redis connected');
        return true;
    } catch (err) {
        console.error('✗ Redis connection failed:', err.message);
        return false;
    }
}

module.exports = { redis, connectRedis };
