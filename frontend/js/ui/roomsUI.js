function showRoomsMenu() {
    const roomsMenu = document.getElementById('roomsMenu');
    if (roomsMenu) {
        roomsMenu.classList.remove('hidden');
    }
}

function hideRoomsMenu() {
    const roomsMenu = document.getElementById('roomsMenu');
    if (roomsMenu) {
        roomsMenu.classList.add('hidden');
    }
}

function updateRoomsList(rooms) {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;
    
    roomsList.innerHTML = '';
    
    if (rooms.length === 0) {
        roomsList.innerHTML = '<li>No hay salas creadas</li>';
        return;
    }
    
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const li = document.createElement('li');
        li.className = 'room-item';
        
        const roomInfo = document.createElement('div');
        roomInfo.className = 'room-info';
        roomInfo.innerHTML = `
            <strong>${room.id}</strong>
            <span class="room-code">${room.code ? 'Código: ' + room.code : 'Sin código'}</span>
            <span class="room-participants">${room.participantIds.length} participante(s)</span>
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'room-buttons';
        
        const enterBtn = document.createElement('button');
        enterBtn.textContent = 'Entrar';
        enterBtn.className = 'enter-room-btn';
        enterBtn.dataset.roomId = room.id;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.className = 'delete-room-btn';
        deleteBtn.dataset.roomId = room.id;
        
        buttonContainer.appendChild(enterBtn);
        buttonContainer.appendChild(deleteBtn);
        
        li.appendChild(roomInfo);
        li.appendChild(buttonContainer);
        roomsList.appendChild(li);
    }
}

function getCreateRoomData() {
    const roomIdInput = document.getElementById('createRoomIdInput');
    const roomCodeInput = document.getElementById('createRoomCodeInput');
    
    return {
        roomId: roomIdInput ? roomIdInput.value.trim() : '',
        code: roomCodeInput ? roomCodeInput.value.trim() : ''
    };
}

function clearCreateRoomForm() {
    const roomIdInput = document.getElementById('createRoomIdInput');
    const roomCodeInput = document.getElementById('createRoomCodeInput');
    
    if (roomIdInput) roomIdInput.value = '';
    if (roomCodeInput) roomCodeInput.value = '';
}

export {
    showRoomsMenu,
    hideRoomsMenu,
    updateRoomsList,
    getCreateRoomData,
    clearCreateRoomForm
};
