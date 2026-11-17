require('dotenv').config();
const { Sequelize } = require('sequelize');
const AppError = require('../utils/AppError');

const activePool = Number(process.env.DB_POOL_MAX) || 20;
const maxTime = Number(process.env.DB_POOL_MAX_TIME_MS) || 10000;
const maxLimit = Number(process.env.DB_POOL_QUEUE_LIMIT) || 20;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
            statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT_MS) || 25000
        },
        pool: {
            max: activePool,
            min: 0,
            acquire: maxTime,
            idle: 10000,
            evict: 1000
        }
    }
);

sequelize.addHook('beforePoolAcquire', () => {
    const waiting = sequelize.connectionManager.pool.waiting || 0;
    if (waiting >= maxLimit) {
        throw new AppError('Database is busy. Try again shortly.', 503, 'POOL_QUEUE_FULL');
    }
});

module.exports = sequelize;
