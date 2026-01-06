const { TEACHER_KEY } = require('../config/constants');
const { getTeacherSocketId, setTeacherSocketId, addParticipant, updateParticipantRoom, getParticipant } = require('../models/participants');
const { getStudentsList, syncTeacherUI } = require('../utils/helpers');
const { getRoomById, getRoomByCode, addParticipantToRoom, removeParticipantFromRoom } = require('../models/rooms');

function handleJoinRoom(socket, io, { name, teacherKey, roomId }) {
    // En primer lugar asignamos un rol al usuario
    const isTeacher = (teacherKey !== '' && teacherKey === TEACHER_KEY);
    const role = isTeacher ? 'profesor' : 'estudiante';
    
    // Validar que los estudiantes proporcionen roomId
    if (!isTeacher && (!roomId || roomId.trim() === '')) {
        socket.emit('joined', { error: "Los estudiantes deben proporcionar un ID de sala." });
        return;
    }
    
    // Buscar sala por roomId o por code
    let room = null;
    let actualRoomId = roomId;
    
    if (roomId) {
        room = getRoomById(roomId);
        if (!room) {
            room = getRoomByCode(roomId);
            if (room) {
                actualRoomId = room.id;
            }
        }
    }
    
    // Validar que la sala exista (solo para estudiantes)
    if (!isTeacher && roomId && !room) {
        socket.emit('joined', { error: "La sala no existe." });
        return;
    }
    
    // Validar que la sala exista para profesores si intentan entrar a una
    if (isTeacher && roomId && !room) {
        socket.emit('joined', { error: "La sala no existe." });
        return;
    }
    
    // Manejamos el caso de que ya haya un profesor conectado
    if (isTeacher) {
        const teacherSocketId = getTeacherSocketId();
        if (teacherSocketId && teacherSocketId !== socket.id) {
            console.log("Otro profesor intentó unirse. RECHAZADO. Ya hay un profesor conectado.");
            socket.emit('joined', { error: "Ya hay un profesor en la sala." });
            return;
        }
        else if (!teacherSocketId) {
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
    
    // Añadir usuario a la sala si proporciona roomId
    if (actualRoomId) {
        addParticipantToRoom(actualRoomId, socket.id);
        updateParticipantRoom(socket.id, actualRoomId);
        socket.join(actualRoomId);
        console.log(`${name} se ha unido a la sala ${actualRoomId} como ${role}, con ID ${socket.id}`);
    } else {
        console.log(`${name} se ha unido como ${role}, con ID ${socket.id} (sin sala asignada)`);
    }
    
    console.log(`Permisos de ${name}: ${hasPermission}`);

    // Eenviamos la confirmacion al cliente confirmando su rol y la lista inicial si es profe
    const personalData = { role: role };

    if (role === 'profesor') {
        // Si es profesor, enviar lista de estudiantes de la sala si está en una
        if (actualRoomId) {
            personalData.participants = getStudentsList(actualRoomId);
            personalData.roomId = actualRoomId;
            personalData.editorCode = room ? room.editorCode : "";
        } else {
            personalData.participants = [];
        }
    } else {
        // Si es estudiante, enviar el roomId de la sala a la que se unió
        personalData.roomId = actualRoomId;
        personalData.editorCode = room ? room.editorCode : "";
    }
    socket.emit('joined', personalData);

    // Acutalizamos la lista del profesor en la sala correspondiente
    if (actualRoomId) {
        syncTeacherUI(io, actualRoomId);
    }
}

module.exports = handleJoinRoom;