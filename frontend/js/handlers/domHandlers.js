import { socket } from '../config.js';
import { getLoginCredentials, validateName } from '../ui/loginUI.js';
import { getEditor, getEditorValue } from '../ui/editorUI.js';
import { toggleStudentPermissionClass } from '../ui/participantsUI.js';

function setupDOMHandlers() {
    // Botón de unirse
    document.getElementById('joinBtn').onclick = () => {
        console.log("Intentando unirse a la sala...");

        const { name, teacherKey } = getLoginCredentials();

        if (!validateName(name)) return;

        socket.emit('joinRoom', { name, teacherKey });

        sessionStorage.setItem('name', name);
        sessionStorage.setItem('teacherKey', teacherKey);
    };

    // Editor de código
    const editor = getEditor();
    editor.addEventListener('input', () => {
        socket.emit('codeChange', { code: getEditorValue(), user: socket.id });
    });

    // Botón de revocar permisos
    document.getElementById('revokeAllBtn').onclick = () => {
        console.log("Eliminando permisos de todos los estudiantes");
        socket.emit('togglePermissions', { target: 'all', give: false });
    };

    // Cuando el profesor le da permisos a un estudiante (clicándolo en el menú de participantes)
    document.getElementById('participantsList').onclick = (event) => {
        if (event.target && event.target.tagName === 'LI') {
            const studentId = event.target.dataset.id;
            const currentlyHasPermission = event.target.classList.contains('has-permission');

            console.log(`Cambiando permisos del estudiante ${studentId}. Actualmente tiene permisos ${currentlyHasPermission}, y se van a establecer a ${!currentlyHasPermission}`);
            socket.emit('togglePermissions', { 
                target: studentId, 
                give: !currentlyHasPermission 
            });

            /**@todo: Esto es solo el prototipo. En la versión final el servidor debe confirmar el cambio */
            toggleStudentPermissionClass(event.target);
        }
    };
}

export { setupDOMHandlers };
