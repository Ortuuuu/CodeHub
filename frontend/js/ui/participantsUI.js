function showParticipantsMenu() {
    document.getElementById('participantsMenu').classList.remove('hidden');
}

function hideParticipantsMenu() {
    document.getElementById('participantsMenu').classList.add('hidden');
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

export { showParticipantsMenu, hideParticipantsMenu, updateParticipantsList, toggleStudentPermissionClass };
