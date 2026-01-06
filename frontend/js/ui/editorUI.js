function showEditor() {
    document.getElementById('editorContainer').classList.remove('hidden');
}

function hideEditor() {
    document.getElementById('editorContainer').classList.add('hidden');
}

function enableEditor() {
    document.getElementById('codeEditor').disabled = false;
}

function disableEditor() {
    document.getElementById('codeEditor').disabled = true;
}

function getEditorValue() {
    return document.getElementById('codeEditor').value;
}

function setEditorValue(code) {
    document.getElementById('codeEditor').value = code;
}

function getEditor() {
    return document.getElementById('codeEditor');
}

function showRoomInfo(roomId) {
    const roomInfo = document.getElementById('roomInfo');
    const roomName = document.getElementById('roomName');
    const leaveBtn = document.getElementById('leaveRoomBtn');
    
    if (roomInfo && roomName) {
        roomName.textContent = `Sala: ${roomId}`;
        roomInfo.classList.remove('hidden');
    }
    
    if (leaveBtn) {
        leaveBtn.classList.remove('hidden');
    }
}

function hideRoomInfo() {
    const roomInfo = document.getElementById('roomInfo');
    const leaveBtn = document.getElementById('leaveRoomBtn');
    
    if (roomInfo) {
        roomInfo.classList.add('hidden');
    }
    
    if (leaveBtn) {
        leaveBtn.classList.add('hidden');
    }
}

export { showEditor, hideEditor, enableEditor, disableEditor, getEditorValue, setEditorValue, getEditor, showRoomInfo, hideRoomInfo };
