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

export { showEditor, hideEditor, enableEditor, disableEditor, getEditorValue, setEditorValue, getEditor };
