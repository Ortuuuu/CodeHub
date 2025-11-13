function showLoginMenu() {
    document.getElementById('loginMenu').classList.remove('hidden');
    document.getElementById('participantsMenu').classList.add('hidden');
    document.getElementById('editorContainer').classList.add('hidden');
}

function hideLoginMenu() {
    document.getElementById('loginMenu').classList.add('hidden');
}

function getLoginCredentials() {
    return {
        name: document.getElementById('nameInput').value,
        teacherKey: document.getElementById('teacherKeyInput').value
    };
}

function validateName(name) {
    if (!name) {
        alert("Por favor, introduce tu nombre");
        return false;
    }
    return true;
}

export { showLoginMenu, hideLoginMenu, getLoginCredentials, validateName };
