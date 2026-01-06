const { getParticipant } = require('../models/participants');

function handleCodeChange(socket, io, { code, user }) {
    const participant = getParticipant(socket.id);
    
    if (!participant) {
        return console.log("Usuario no encontrado al cambiar código.");
    }
    
    // Obtener la sala del usuario
    const roomId = participant.currentRoomId;
    
    if (!roomId) {
        return console.log("Usuario no está en ninguna sala.");
    }
    
    // Emitir cambio de código solo a la sala específica, excluyendo al emisor
    socket.to(roomId).emit('serverCodeUpdate', code);
}

module.exports = handleCodeChange;