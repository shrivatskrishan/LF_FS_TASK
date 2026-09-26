const app = require('./app');
const { sequelize } = require('./models');

function start() {
    const port = process.env.PORT || 3000;
    const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS) || 30000;

    sequelize.authenticate()
        .then(() => console.log('✓ Database connected'))
        .catch((err) => console.error('✗ Database connection failed:', err));

    return sequelize.sync({ alter: false })
        .then(() => {
            const server = app.listen(port, () => {
                console.log(`✓ Server running on http://localhost:${port}`);
            });
            server.requestTimeout = requestTimeoutMs;
            server.headersTimeout = requestTimeoutMs + 1000;
            server.setTimeout(requestTimeoutMs);
            return server;
        })
        .catch((err) => {
            console.error('✗ Failed to sync database:', err);
        });
}

module.exports = { app, start };
