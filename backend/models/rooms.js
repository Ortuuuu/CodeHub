// Estructura global de rooms
// rooms = {
//     roomId: {
//         id: roomId,
//         code: "ABC123",
//         participantIds: [socketId1, socketId2, ...],
//         editorCode: ""
//     }
// }
const rooms = {};

function createRoom(roomId, code = "") {
    rooms[roomId] = {
        id: roomId,
        code: code,
        participantIds: [],
        editorCode: ""
    };
    return rooms[roomId];
}

function deleteRoom(roomId) {
    if (rooms[roomId]) {
        delete rooms[roomId];
        return true;
    }
    return false;
}

function getRoomById(roomId) {
    return rooms[roomId] || null;
}

function addParticipantToRoom(roomId, socketId) {
    const room = rooms[roomId];
    if (!room) {
        return false;
    }
    
    // Solo añadir si no está ya en la sala
    if (!room.participantIds.includes(socketId)) {
        room.participantIds.push(socketId);
    }
    
    return true;
}

function removeParticipantFromRoom(roomId, socketId) {
    const room = rooms[roomId];
    if (!room) {
        return false;
    }
    
    // Buscar y eliminar el participante
    for (let i = 0; i < room.participantIds.length; i++) {
        if (room.participantIds[i] === socketId) {
            room.participantIds.splice(i, 1);
            break;
        }
    }
    
    return true;
}

function updateRoomCode(roomId, newCode) {
    const room = rooms[roomId];
    if (!room) {
        return false;
    }
    
    room.code = newCode;
    return true;
}

function updateRoomEditorCode(roomId, editorCode) {
    const room = rooms[roomId];
    if (!room) {
        return false;
    }
    
    room.editorCode = editorCode;
    return true;
}

function getRoomByCode(code) {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.code && room.code === code) {
            return room;
        }
    }
    return null;
}

function getRoomBySocketId(socketId) {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        for (let i = 0; i < room.participantIds.length; i++) {
            if (room.participantIds[i] === socketId) {
                return room;
            }
        }
    }
    return null;
}

function getAllRooms() {
    const roomsList = [];
    for (const roomId in rooms) {
        roomsList.push(rooms[roomId]);
    }
    return roomsList;
}

module.exports = {
    createRoom,
    deleteRoom,
    getRoomById,
    getRoomByCode,
    addParticipantToRoom,
    removeParticipantFromRoom,
    updateRoomCode,
    updateRoomEditorCode,
    getRoomBySocketId,
    getAllRooms
};
