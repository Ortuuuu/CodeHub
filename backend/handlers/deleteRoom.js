const { deleteRoom, getRoomById } = require('../models/rooms');
const { getParticipant, updateParticipantRoom } = require('../models/participants');

function handleDeleteRoom(socket, io, { roomId }) {
    const participant = getParticipant(socket.id);
    
    // Verificar que el usuario esté registrado y sea profesor
    if (!participant) {
        socket.emit('deleteRoomError', { message: 'Usuario no registrado' });
        return;
    }
    
    if (participant.role !== 'profesor') {
        socket.emit('deleteRoomError', { message: 'Solo profesores pueden eliminar salas' });
        return;
    }
    
    // Verificar que la sala exista
    const room = getRoomById(roomId);
    if (!room) {
        socket.emit('deleteRoomError', { message: 'La sala no existe' });
        return;
    }
    
    // Expulsar a todos los participantes de la sala Socket.IO
    for (let i = 0; i < room.participantIds.length; i++) {
        const participantId = room.participantIds[i];
        const socketInstance = io.sockets.sockets.get(participantId);
        
        if (socketInstance) {
            socketInstance.leave(roomId);
            
            // Actualizar el participante para que no tenga sala
            updateParticipantRoom(participantId, null);
            
            // Notificar al participante que la sala fue eliminada
            socketInstance.emit('roomDeleted', { roomId });
        }
    }
    
    // Eliminar la sala
    deleteRoom(roomId);
    
    console.log(`Sala eliminada: ${roomId} por ${participant.name}`);
    
    // Confirmar eliminación al profesor
    socket.emit('roomDeletedSuccess', { roomId });
    
    // Notificar a todos sobre la actualización de salas
    io.emit('roomsUpdated');
}

module.exports = handleDeleteRoom;
