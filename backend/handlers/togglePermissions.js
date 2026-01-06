const { getTeacherSocketId, getParticipant } = require('../models/participants');
const { toggleAllStudentsPermissions, toggleStudentPermission, syncTeacherUI } = require('../utils/helpers');

function handleTogglePermissions(socket, io, { target, give, roomId }) {
    const teacherSocketId = getTeacherSocketId();
    
    if (socket.id !== teacherSocketId) {
        return console.log("Un usuario que no es profesor intentó cambiar permisos.");
    }
    else if (target === teacherSocketId) {
        return console.log("El profesor no puede cambiar sus propios permisos.");
    }
    else if (!roomId) {
        return console.log("No se proporcionó roomId para cambiar permisos.");
    }
    else if (target === 'all') {
        console.log(`El profesor le ha ${give ? 'dado' : 'quitado'} los permisos a todos los estudiantes en la sala ${roomId}.`);
        toggleAllStudentsPermissions(io, give, roomId);
        syncTeacherUI(io, roomId);
    }
    else {
        const targetStudent = getParticipant(target);
        if (!targetStudent) {
            return console.log("Estudiante no encontrado.");
        }
        
        // Verificar que el estudiante esté en la sala correcta
        if (targetStudent.currentRoomId !== roomId) {
            return console.log(`El estudiante ${targetStudent.name} no está en la sala ${roomId}.`);
        }
        
        console.log(`El profesor le ha ${give ? 'dado' : 'quitado'} los permisos al estudiante ${targetStudent.name} en la sala ${roomId}.`);
        toggleStudentPermission(io, target, give);
    }
}

module.exports = handleTogglePermissions;