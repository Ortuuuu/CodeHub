const { removeParticipantFromRoom } = require('../models/rooms');
const { getParticipant, updateParticipantRoom } = require('../models/participants');
const { syncTeacherUI } = require('../utils/helpers');

function handleLeaveRoom(socket, io) {
    const participant = getParticipant(socket.id);
    
    if (!participant) {
        socket.emit('leaveRoomError', { message: 'Usuario no registrado' });
        return;
    }
    
    const currentRoomId = participant.currentRoomId;
    
    if (!currentRoomId) {
        socket.emit('leaveRoomError', { message: 'No estás en ninguna sala' });
        return;
    }
    
    // Eliminar al participante de la sala
    removeParticipantFromRoom(currentRoomId, socket.id);
    
    // Salir de la sala Socket.IO
    socket.leave(currentRoomId);
    
    // Actualizar el participante
    updateParticipantRoom(socket.id, null);
    
    console.log(`${participant.name} salió de la sala ${currentRoomId}`);
    
    // Confirmar al usuario
    socket.emit('leftRoom', { roomId: currentRoomId });
    
    // Sincronizar con profesores en la sala
    syncTeacherUI(io, currentRoomId);
}

module.exports = handleLeaveRoom;
