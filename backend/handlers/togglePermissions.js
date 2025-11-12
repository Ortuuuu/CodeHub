const { getTeacherSocketId, getParticipant } = require('../models/participants');
const { toggleAllStudentsPermissions, toggleStudentPermission, syncTeacherUI } = require('../utils/helpers');

function handleTogglePermissions(socket, io, { target, give }) {
    const teacherSocketId = getTeacherSocketId();
    
    if (socket.id !== teacherSocketId) {
        return console.log("Un usuario que no es profesor intentó cambiar permisos.");
    }
    else if (target === teacherSocketId) {
        return console.log("El profesor no puede cambiar sus propios permisos.");
    }
    else if (target === 'all') {
        console.log("El profesor le ha quitado los permisos a todos los estudiantes.");
        toggleAllStudentsPermissions(io, give);
        syncTeacherUI(io);
    }
    else {
        const targetStudent = getParticipant(target);
        console.log(`El profesor le ha ${give ? 'dado' : 'quitado'} los permisos al estudiante ${targetStudent.name}.`);
        toggleStudentPermission(io, target, give);
    }
}

module.exports = handleTogglePermissions;