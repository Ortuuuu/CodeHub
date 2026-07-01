function showParticipantsBar() {
    document.getElementById('participantsBar').classList.remove('hidden');
    const toggleBtn = document.getElementById('toggleParticipantsBtn');
    if (toggleBtn) {
        toggleBtn.textContent = 'Ocultar participantes';
    }
}

function hideParticipantsBar() {
    document.getElementById('participantsBar').classList.add('hidden');
    const toggleBtn = document.getElementById('toggleParticipantsBtn');
    if (toggleBtn) {
        toggleBtn.textContent = 'Mostrar participantes';
    }
}

function updateParticipantsList(students) {
    const list = document.getElementById('participantsList');
    list.innerHTML = '';

    for (let i = 0; i < students.length; i++) {
        console.log(`Agregando estudiante: ${students[i].name}`);
        const student = students[i];
        const newLi = document.createElement('li');
        newLi.textContent = student.name;
        newLi.dataset.id = student.id;

        if (student.hasPermission) {
            newLi.classList.add('has-permission');
        }
        list.appendChild(newLi);
    }
}

function toggleStudentPermissionClass(studentElement) {
    studentElement.classList.toggle('has-permission');
}

export { showParticipantsBar, hideParticipantsBar, updateParticipantsList, toggleStudentPermissionClass };
