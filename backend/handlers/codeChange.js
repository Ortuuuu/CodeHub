const { getParticipants } = require('../models/participants');

function handleCodeChange(socket, io, { code, user }) {
    const participants = getParticipants();
    for (let id in participants) {
        if (id !== user) io.to(id).emit('serverCodeUpdate', code);
    }
}

module.exports = handleCodeChange;