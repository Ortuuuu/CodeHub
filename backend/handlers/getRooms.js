const { getAllRooms } = require('../models/rooms');
const { getParticipant } = require('../models/participants');

function handleGetRooms(socket, io) {
    const participant = getParticipant(socket.id);
    
    if (!participant) {
        socket.emit('getRoomsError', { message: 'Usuario no registrado' });
        return;
    }
    
    if (participant.role !== 'profesor') {
        socket.emit('getRoomsError', { message: 'Solo profesores pueden ver todas las salas' });
        return;
    }
    
    const rooms = getAllRooms();
    
    // Enviar lista de salas al profesor
    socket.emit('roomsList', { rooms });
}

module.exports = handleGetRooms;
