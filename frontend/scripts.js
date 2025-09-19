const socket = io("http://localhost:3000");  // Conectar al servidor Socket.IO del backend


function updateParticipantsUI(students) {
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
};

// Solicitud de conexión a la sala
document.getElementById('joinBtn').onclick = () => {
  const name = document.getElementById('nameInput').value;
  const teacherKey = document.getElementById('teacherKeyInput').value;

  if (!name) return alert("Por favor, introduce tu nombre");

  socket.emit('joinRoom', { name: name, teacherKey: teacherKey });
};


// Recepción de confirmación de unión a la sala por parte del servidor. La data tendrá el foramto { role: 'profesor'/'estudiante', participants: [...] }, o bien el formato { error: "mensaje de error" } si hubo un problema
socket.on('joined', data => {
  if(data.error) {
    return alert(data.error);
  }

  if (data.role === 'profesor') {
    document.getElementById('loginMenu').classList.add('hidden');

    document.getElementById('participantsMenu').classList.remove('hidden');
    document.getElementById('editorContainer').classList.remove('hidden');
    document.getElementById('codeEditor').disabled = false;

    updateParticipantsUI(data.participants || []);
  } 
  else if (data.role === 'estudiante') {
    document.getElementById('loginMenu').classList.add('hidden');
    document.getElementById('editorContainer').classList.remove('hidden');
  }
  else {
    // Rol desconocido
    alert("Error: Rol desconocido recibido del servidor.");
  }
});

// Recepción de actualización de la lista de participantes para actualizar la UI del profesor
socket.on('updateParticipants', participants => {
  updateParticipantsUI(participants);
});

// Envío de cambios en el editor al servidor
const editor = document.getElementById('codeEditor');
editor.addEventListener('input', () => {
  socket.emit('codeChange', { code: editor.value, user: socket.id });
});

// sincronizacion del codigo en el editor por parte del servidor
socket.on('serverCodeUpdate', newContent => {
  editor.value = newContent;
});

// Revocar permisos de escritura a todos los estudiantes
document.getElementById('revokeAllBtn').onclick = () => {
  console.log("Elminando permisos de todos los estudiantes");
  socket.emit('togglePermissions', { target: 'all', give: false });
}

// Cuando el profesor le da permisos a un estudiante (clicandolo en el menu de participantes)
document.getElementById('participantsList').onclick = (event) => {
  console.log("Click en la lista de participantes");
  if (event.target && event.target.tagName === 'LI') {
    const studentId = event.target.dataset.id;
    const currentlyHasPermission = event.target.classList.contains('has-permission');

    console.log(`Cambiando permisos del estudiante ${studentId}. Actualmente tiene permisos ${currentlyHasPermission}, y se van a establecer a ${!currentlyHasPermission}`);
    socket.emit('togglePermissions', { target: studentId, give: !currentlyHasPermission });

    /**@todo: Esto es solo el prototipo. En la versión final el servidor debe confirmar el cambio */
    if (currentlyHasPermission) event.target.classList.remove('has-permission');
    else event.target.classList.add('has-permission');
  }
};

// Recepción de cambio de permisos para el estudiante
socket.on('permissionChanged', hasPermission => {
  /** @todo  mostrar el borde parpadeando en rojo para indicar que se le han concedido/eliminado permisos*/
  const editor = document.getElementById('codeEditor');
  editor.disabled = !hasPermission;
});