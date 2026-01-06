const { TEACHER_KEY } = require('../config/constants');
const { getTeacherSocketId, setTeacherSocketId, addParticipant, updateParticipantRoom, getParticipant } = require('../models/participants');
const { getStudentsList, syncTeacherUI } = require('../utils/helpers');
const { getRoomById, addParticipantToRoom, removeParticipantFromRoom } = require('../models/rooms');

function handleJoinRoom(socket, io, { name, teacherKey, roomId }) {
    // En primer lugar asignamos un rol al usuario
    const isTeacher = (teacherKey !== '' && teacherKey === TEACHER_KEY);
    const role = isTeacher ? 'profesor' : 'estudiante';
    
    // Validar que los estudiantes proporcionen roomId
    if (!isTeacher && (!roomId || roomId.trim() === '')) {
        socket.emit('joined', { error: "Los estudiantes deben proporcionar un ID de sala." });
        return;
    }
    
    // Validar que la sala exista (solo para estudiantes)
    if (!isTeacher) {
        const room = getRoomById(roomId);
        if (!room) {
            socket.emit('joined', { error: "La sala no existe." });
            return;
        }
    }
    
    // Manejamos el caso de que ya haya un profesor conectado
    if (isTeacher) {
        const teacherSocketId = getTeacherSocketId();
        if (teacherSocketId) {
            console.log("Otro profesor intentó unirse. RECHAZADO. Ya hay un profesor conectado.");
            socket.emit('joined', { error: "Ya hay un profesor en la sala." });
            return;
        }
        else {
            setTeacherSocketId(socket.id);
        }
    }

    // Se establecen los permisos iniciales
    const hasPermission = (role === 'profesor');

    // Guardamos la info del usuario en la lista de participantes 
    addParticipant(socket.id, name, role, hasPermission);
    
    // Si el usuario ya estaba en otra sala, sacarlo de ahí primero
    const participant = getParticipant(socket.id);
    if (participant.currentRoomId) {
        const oldRoomId = participant.currentRoomId;
        removeParticipantFromRoom(oldRoomId, socket.id);
        socket.leave(oldRoomId);
        console.log(`${name} salió de la sala ${oldRoomId}`);
    }
    
    // Añadir usuario a la nueva sala (solo si es estudiante con roomId)
    if (!isTeacher && roomId) {
        addParticipantToRoom(roomId, socket.id);
        updateParticipantRoom(socket.id, roomId);
        socket.join(roomId);
        console.log(`${name} se ha unido a la sala ${roomId} como ${role}, con ID ${socket.id}`);
    } else {
        console.log(`${name} se ha unido como ${role}, con ID ${socket.id} (sin sala asignada)`);
    }
    
    console.log(`Permisos de ${name}: ${hasPermission}`);

    // Eenviamos la confirmacion al cliente confirmando su rol y la lista inicial si es profe
    const personalData = { role: role };

    if (role === 'profesor') {
        // Si es profesor, enviar lista vacía inicialmente (no está en ninguna sala aún)
        personalData.participants = [];
    } else {
        // Si es estudiante, enviar el roomId de la sala a la que se unió
        personalData.roomId = roomId;
    }
    socket.emit('joined', personalData);

    // Acutalizamos la lista del profesor en la sala correspondiente
    if (role === 'estudiante' && roomId) {
        syncTeacherUI(io, roomId);
    }
}

module.exports = handleJoinRoom;