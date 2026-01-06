const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PORT, FRONTEND_URL } = require('./config/constants');
const handleJoinRoom = require('./handlers/joinRoom');
const handleDisconnect = require('./handlers/disconnect');
const handleCodeChange = require('./handlers/codeChange');
const handleTogglePermissions = require('./handlers/togglePermissions');
const handleCreateRoom = require('./handlers/createRoom');
const handleDeleteRoom = require('./handlers/deleteRoom');
const handleLeaveRoom = require('./handlers/leaveRoom');
const handleGetRooms = require('./handlers/getRooms');

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
    socket.on('createRoom', (data) => handleCreateRoom(socket, io, data));
    socket.on('deleteRoom', (data) => handleDeleteRoom(socket, io, data));
    socket.on('leaveRoom', () => handleLeaveRoom(socket, io));
    socket.on('getRooms', () => handleGetRooms(socket, io));
});
