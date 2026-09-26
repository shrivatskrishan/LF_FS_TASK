require('dotenv').config();
const { Sequelize } = require('sequelize');

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
        }
    }
);

module.exports = sequelize;
