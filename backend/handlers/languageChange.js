const { getTeacherSocketId, getParticipant } = require('../models/participants');
const { updateRoomLanguage } = require('../models/rooms');

function handleLanguageChange(socket, io, { language, roomId }) {
    const teacherSocketId = getTeacherSocketId();
    
    // Validar que solo el profesor puede cambiar lenguaje
    if (socket.id !== teacherSocketId) {
        return console.log("Un usuario que no es profesor ha intentado cambiar el lenguaje.");
    }
    
    if (!roomId) {
        return console.log("Se esta intentando cambiar el lenguaje desde fuera de una sala");
    }
    
    // Actualizar el lenguaje de la sala en backk
    updateRoomLanguage(roomId, language);
    
    console.log(`El profesor cambió el lenguaje a ${language} en la sala ${roomId}`);
    
    socket.to(roomId).emit('languageChanged', { language });
}

module.exports = handleLanguageChange;
