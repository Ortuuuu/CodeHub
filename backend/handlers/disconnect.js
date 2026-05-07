const { getTeacherSocketId, setTeacherSocketId, getParticipant, removeParticipant } = require('../models/participants');
const { removeParticipantFromRoom } = require('../models/rooms');
const { syncTeacherUI } = require('../utils/helpers');

function handleDisconnect(socket, io) {
    const user = getParticipant(socket.id);
    if (!user) {
        // Puede pasar si el cliente se desconecta antes de hacer joinRoom
        return console.log("Cliente inconsistente desconectado, no estaba en la lista de participantes.");
    }

    console.log(`Cliente ${socket.id} desconectado. (Nombre: ${user.name})`);

    // Si se desconecta el profesor, reseteamos el id
    if (socket.id === getTeacherSocketId()) {
        setTeacherSocketId(null);
        console.log("El usuario que se ha desconectado era el profesor.");
    }
    
    const currentRoomId = user.currentRoomId;
    // Si el usuario estaba en una sala, eliminarlo de ahí
    if (currentRoomId) {
        removeParticipantFromRoom(currentRoomId, socket.id);
        socket.leave(currentRoomId);
    }
    removeParticipant(socket.id);
    
    // Actualizar lista del profesor en esa sala
    if (currentRoomId) {
        syncTeacherUI(io, currentRoomId);
    }
}

module.exports = handleDisconnect;