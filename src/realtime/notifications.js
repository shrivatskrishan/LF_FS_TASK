const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

const clients = new Set();

function attachNotifications(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (socket, request) => {
        if (request.socket) request.socket.setTimeout(0);

        const url = new URL(request.url, 'http://localhost');
        const token = url.searchParams.get('token');

        if (!token || !process.env.JWT_SECRET) {
            socket.close(4001, 'Unauthorized');
            return;
        }

        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = payload.id;
        } catch (err) {
            socket.close(4001, 'Unauthorized');
            return;
        }

        clients.add(socket);
        const ping = setInterval(() => {
            if (socket.readyState === socket.OPEN) socket.ping();
        }, 20000);

        socket.on('close', () => {
            clearInterval(ping);
            clients.delete(socket);
        });
    });

    return wss;
}

function publish(event) {
    const payload = JSON.stringify(event);
    for (const socket of clients) {
        if (socket.readyState === socket.OPEN) {
            socket.send(payload);
        }
    }
}

module.exports = { attachNotifications, publish };
