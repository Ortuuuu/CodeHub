const { getParticipants, getTeacherSocketId } = require('../models/participants');

function getStudentsList() {
    const participants = getParticipants();
    const studentsList = [];
    for (let id in participants) {
        const client = participants[id];
        if (client.role === 'estudiante') {
            studentsList.push({ 
                id: id, 
                name: client.name, 
                hasPermission: client.hasPermission 
            });
        }
    }
    return studentsList;
}

function syncTeacherUI(io) {
    const teacherSocketId = getTeacherSocketId();
    if (teacherSocketId) {
        io.to(teacherSocketId).emit('updateParticipants', getStudentsList());
    }
}

function toggleAllStudentsPermissions(io, give) {
    const participants = getParticipants();
    for (let id in participants) {
        if (participants[id].role === 'estudiante') {
            participants[id].hasPermission = give;
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
