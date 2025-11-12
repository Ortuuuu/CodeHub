const { getTeacherSocketId, setTeacherSocketId, getParticipant, removeParticipant } = require('../models/participants');
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

    removeParticipant(socket.id);

    // Actualizamos la lista del profesor
    syncTeacherUI(io);
}

module.exports = handleDisconnect;