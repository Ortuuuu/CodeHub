import { socket } from '../config.js';
import { showLoginMenu, hideLoginMenu } from '../ui/loginUI.js';
import { showEditor, hideEditor, enableEditor, disableEditor, setEditorValue } from '../ui/editorUI.js';
import { showParticipantsMenu, updateParticipantsList } from '../ui/participantsUI.js';

function setupSocketEventsHandlers() {
    // Conexión o reconexión
    socket.on('connect', () => {
        const name = sessionStorage.getItem('name');
        const teacherKey = sessionStorage.getItem('teacherKey');

        if (name) {
            console.log(`Reconectado al servidor con id: ${socket.id}`);
            socket.emit('joinRoom', { name, teacherKey });
        } else {
            console.log(`Conectado al servidor con id: ${socket.id}`);
        }
    });

    // Desconexión
    socket.on('disconnect', () => {
        // Si nos hemos desconectado, refrescamos la pestaña en caso de que siga abierta, mostramos el menu de login y ocultamos el editor y el menu de participantes
        if (document.visibilityState === 'visible') {
            location.reload();
        }
        
        showLoginMenu();
        hideEditor();
        disableEditor();
        console.log("Desconectado del servidor. Intentando reconectar...");
    });

    // Recepción de confirmación de unión a la sala por parte del servidor. La data tendrá el formato { role: 'profesor'/'estudiante', participants: [...] }, o bien el formato { error: "mensaje de error" } si hubo un problema
    socket.on('joined', (data) => {
        if (data.error) {
            return alert(data.error);
        }

        if (data.role === 'profesor') {
            hideLoginMenu();
            showParticipantsMenu();
            showEditor();
            enableEditor();
            updateParticipantsList(data.participants || []);
        } 
        else if (data.role === 'estudiante') {
            hideLoginMenu();
            showEditor();
        }
        else {
            alert("Error: Rol desconocido recibido del servidor.");
        }
    });

    // Actualización de participantes
    socket.on('updateParticipants', (participants) => {
        updateParticipantsList(participants);
    });

    // Sincronización del código en el editor por parte del servidor
    socket.on('serverCodeUpdate', (newContent) => {
        setEditorValue(newContent);
    });

    // Recepción de cambio de permisos para el estudiante
    socket.on('permissionChanged', (hasPermission) => {
        /** @todo mostrar el borde parpadeando en rojo para indicar que se le han concedido/eliminado permisos*/
        if (hasPermission) {
            enableEditor();
        } else {
            disableEditor();
        }
    });
}

export { setupSocketEventsHandlers };
