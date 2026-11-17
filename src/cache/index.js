const { redis } = require('../config/redis');

const PREFIX = 'social:';
const VERSION_KEY = `${PREFIX}version`;
const ttlSeconds = Number(process.env.REDIS_TTL_SECONDS) || 60;
const inflight = new Map();

function ready() {
    return redis.status === 'ready';
}

function storageKey(version, name) {
    return `${PREFIX}${version}:${name}`;
}

async function currentVersion() {
    if (!ready()) return '0';
    try {
        return (await redis.get(VERSION_KEY)) || '0';
    } catch (err) {
        console.error('cache version failed:', err.message);
        return '0';
    }
}

async function read(name) {
    if (!ready()) return null;
    try {
        const version = await currentVersion();
        const raw = await redis.get(storageKey(version, name));
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('cache read failed:', err.message);
        return null;
    }
}

async function write(name, value) {
    if (!ready()) return;
    try {
        const version = await currentVersion();
        await redis.set(storageKey(version, name), JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        console.error('cache write failed:', err.message);
    }
}

async function remember(name, loader) {
    const hit = await read(name);
    if (hit !== null) return hit;

    const version = await currentVersion();
    const pendingKey = storageKey(version, name);
    if (inflight.has(pendingKey)) return inflight.get(pendingKey);

    const pending = Promise.resolve()
        .then(loader)
        .then(async (value) => {
            await write(name, value);
            return value;
        })
        .finally(() => inflight.delete(pendingKey));

    inflight.set(pendingKey, pending);
    return pending;
}

async function invalidate() {
    if (!ready()) return;
    try {
        await redis.incr(VERSION_KEY);
    } catch (err) {
        console.error('cache invalidate failed:', err.message);
    }
}

module.exports = { remember, invalidate };
