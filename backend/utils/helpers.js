const { getParticipants, getTeacherSocketId } = require('../models/participants');

function getStudentsList(roomId) {
    const participants = getParticipants();
    const studentsList = [];
    for (let id in participants) {
        const client = participants[id];
        // Filtrar solo estudiantes de la sala especificada
        if (client.role === 'estudiante' && client.currentRoomId === roomId) {
            studentsList.push({ 
                id: id, 
                name: client.name, 
                hasPermission: client.hasPermission 
            });
        }
    }
    return studentsList;
}

function syncTeacherUI(io, roomId) {
    const teacherSocketId = getTeacherSocketId();
    if (teacherSocketId && roomId) {
        io.to(teacherSocketId).emit('updateParticipants', {
            roomId: roomId,
            students: getStudentsList(roomId)
        });
    }
}

function toggleAllStudentsPermissions(io, give, roomId) {
    const participants = getParticipants();
    for (let id in participants) {
        const participant = participants[id];
        // Solo cambiar permisos de estudiantes en la sala específica
        if (participant.role === 'estudiante' && participant.currentRoomId === roomId) {
            participant.hasPermission = give;
            io.to(id).emit('permissionChanged', give);
        }
    }
}

function toggleStudentPermission(io, studentId, give) {
    const participants = getParticipants();
    participants[studentId].hasPermission = give;
    io.to(studentId).emit('permissionChanged', give);
}

module.exports = {
    getStudentsList,
    syncTeacherUI,
    toggleAllStudentsPermissions,
    toggleStudentPermission
};
