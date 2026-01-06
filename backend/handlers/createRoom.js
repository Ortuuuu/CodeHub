const { createRoom } = require('../models/rooms');
const { getParticipant } = require('../models/participants');

function handleCreateRoom(socket, io, { roomId, code }) {
    const participant = getParticipant(socket.id);
    
    // Verificar que el usuario esté registrado y sea profesor
    if (!participant) {
        socket.emit('createRoomError', { message: 'Usuario no registrado' });
        return;
    }
    
    if (participant.role !== 'profesor') {
        socket.emit('createRoomError', { message: 'Solo profesores pueden crear salas' });
        return;
    }
    
    // Verificar que roomId no esté vacío
    if (!roomId || roomId.trim() === '') {
        socket.emit('createRoomError', { message: 'El ID de la sala no puede estar vacío' });
        return;
    }
    
    // Crear la sala
    const room = createRoom(roomId, code || '');
    
    console.log(`Sala creada: ${roomId} por ${participant.name}`);
    
    // Enviar confirmación al profesor
    socket.emit('roomCreated', { room });
    
    // Notificar a todos los profesores sobre la nueva sala (para actualizar listas)
    io.emit('roomsUpdated');
}

module.exports = handleCreateRoom;
