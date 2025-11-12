const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PORT, FRONTEND_URL } = require('./config/constants');
const handleJoinRoom = require('./handlers/joinRoom');
const handleDisconnect = require('./handlers/disconnect');
const handleCodeChange = require('./handlers/codeChange');
const handleTogglePermissions = require('./handlers/togglePermissions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

server.listen(PORT, () => {
    console.log(`Servidor de sockets escuchando en el puerto: ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`Nueva conexión: ${socket.id}`);

    socket.on('joinRoom', (data) => handleJoinRoom(socket, io, data));
    socket.on('disconnect', () => handleDisconnect(socket, io));
    socket.on('codeChange', (data) => handleCodeChange(socket, io, data));
    socket.on('togglePermissions', (data) => handleTogglePermissions(socket, io, data));
});
