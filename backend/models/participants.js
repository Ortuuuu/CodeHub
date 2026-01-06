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
    participants[socketId] = { name, role, hasPermission, currentRoomId: null };
}

function removeParticipant(socketId) {
    delete participants[socketId];
}

function getParticipant(socketId) {
    return participants[socketId];
}

function updateParticipantRoom(socketId, roomId) {
    if (participants[socketId]) {
        participants[socketId].currentRoomId = roomId;
    }
}

module.exports = {
    getParticipants,
    getTeacherSocketId,
    setTeacherSocketId,
    addParticipant,
    removeParticipant,
    getParticipant,
    updateParticipantRoom
};
