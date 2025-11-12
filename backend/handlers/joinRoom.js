const { TEACHER_KEY } = require('../config/constants');
const { getTeacherSocketId, setTeacherSocketId, addParticipant } = require('../models/participants');
const { getStudentsList, syncTeacherUI } = require('../utils/helpers');

function handleJoinRoom(socket, io, { name, teacherKey }) {
    // En primer lugar asignamos un rol al usuario
    const isTeacher = (teacherKey !== '' && teacherKey === TEACHER_KEY);
    const role = isTeacher ? 'profesor' : 'estudiante';
    
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
    console.log(`${name} se ha unido como ${role}, con ID ${socket.id} y con permisos: ${hasPermission}`);

    // Eenviamos la confirmacion al cliente confirmando su rol y la lista inicial si es profe
    const personalData = { role: role };

    if (role === 'profesor') {
        personalData.participants = getStudentsList();
    }
    socket.emit('joined', personalData);

    // Acutalizamos la lista del profesor
    if (role === 'estudiante') {
        syncTeacherUI(io);
    }
}

module.exports = handleJoinRoom;