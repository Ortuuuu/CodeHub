const participants = {};
let teacherSocketId = null;

function getParticipants() {
    return participants;
}

function getTeacherSocketId() {
    return teacherSocketId;
}

function setTeacherSocketId(socketId) {
    teacherSocketId = socketId;
}

function addParticipant(socketId, name, role, hasPermission) {
    participants[socketId] = { name, role, hasPermission };
}

function removeParticipant(socketId) {
    delete participants[socketId];
}

function getParticipant(socketId) {
    return participants[socketId];
}

module.exports = {
    getParticipants,
    getTeacherSocketId,
    setTeacherSocketId,
    addParticipant,
    removeParticipant,
    getParticipant
};
