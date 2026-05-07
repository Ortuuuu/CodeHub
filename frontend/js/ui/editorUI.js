import * as CodeMirror from '../editor/editorCodeMirror.js';

let editorInitialized = false;

function showEditor() {
    document.getElementById('editorContainer').classList.remove('hidden');
}

function hideEditor() {
    document.getElementById('editorContainer').classList.add('hidden');
}

function showEditorControls() {
    document.getElementById('editorControls').classList.remove('hidden');
}

function hideEditorControls() {
    document.getElementById('editorControls').classList.add('hidden');
}

function initializeEditor(onChange) {
    if (editorInitialized) {
        // Si ya está inicializado, solo actualizamos el estado
        return true; // Indica que ya existía
    }
    
    const container = document.getElementById('codeEditor');
    CodeMirror.createEditor(container, onChange);
    editorInitialized = true;
    
    // Actualizar icono del tema según el estado inicial
    updateThemeIcon();
    
    return false; // Indica que fue creado ahora
}

function enableEditor() {
    CodeMirror.enableEditor();
}

function disableEditor() {
    CodeMirror.disableEditor();
}

function getEditorValue() {
    return CodeMirror.getValue();
}

function setEditorValue(code) {
    CodeMirror.setValue(code);
}

function getEditor() {
    return CodeMirror.getEditor();
}

function setLanguage(language) {
    CodeMirror.setLanguage(language);
}

function toggleTheme() {
    const isDark = CodeMirror.toggleTheme();
    updateThemeIcon();
    return isDark;
}

function updateThemeIcon() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.textContent = CodeMirror.isDark() ? '🌙' : '☀️';
    }
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

export { 
    showEditor, 
    hideEditor, 
    showEditorControls,
    hideEditorControls,
    initializeEditor,
    enableEditor, 
    disableEditor, 
    getEditorValue, 
    setEditorValue, 
    getEditor, 
    setLanguage,
    toggleTheme,
    showRoomInfo, 
    hideRoomInfo 
};
