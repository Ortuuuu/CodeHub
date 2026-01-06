const { getTeacherSocketId, setTeacherSocketId, getParticipant, removeParticipant } = require('../models/participants');
const { removeParticipantFromRoom } = require('../models/rooms');
const { syncTeacherUI } = require('../utils/helpers');

function handleDisconnect(socket, io) {
    const user = getParticipant(socket.id);
    if (!user) {
        return console.log("Cliente inconsistente desconectado, no estaba en la lista de participantes.");
    }

    console.log(`Cliente ${socket.id} desconectado. (Nombre: ${user.name})`);

    // Si se desconecta el profesor, reseteamos el id
    if (socket.id === getTeacherSocketId()) {
        setTeacherSocketId(null);
        console.log("El usuario que se ha desconectado era el profesor.");
    }
    
    // Si el usuario estaba en una sala, eliminarlo de ahí
    if (user.currentRoomId) {
        removeParticipantFromRoom(user.currentRoomId, socket.id);
        socket.leave(user.currentRoomId);
        
        // Actualizar la lista del profesor en esa sala
        syncTeacherUI(io, user.currentRoomId);
    }

    removeParticipant(socket.id);
}

module.exports = handleDisconnect;