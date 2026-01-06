import { socket } from '../config.js';
import { showLoginMenu, hideLoginMenu } from '../ui/loginUI.js';
import { showEditor, hideEditor, enableEditor, disableEditor, setEditorValue, showRoomInfo, hideRoomInfo } from '../ui/editorUI.js';
import { showParticipantsMenu, hideParticipantsMenu, updateParticipantsList } from '../ui/participantsUI.js';
import { showRoomsMenu, updateRoomsList, clearCreateRoomForm } from '../ui/roomsUI.js';

function setupSocketEventsHandlers() {
    // Conexión o reconexión
    socket.on('connect', () => {
        const name = sessionStorage.getItem('name');
        const teacherKey = sessionStorage.getItem('teacherKey');
        const roomId = sessionStorage.getItem('roomId');

        if (name) {
            console.log(`Reconectado al servidor con id: ${socket.id}`);
            socket.emit('joinRoom', { name, teacherKey, roomId });
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
            showRoomsMenu();
            
            // Si el profesor entró a una sala, mostrar editor y participantes
            if (data.roomId) {
                showParticipantsMenu();
                showEditor();
                enableEditor();
                updateParticipantsList(data.participants || []);
                showRoomInfo(data.roomId);
                sessionStorage.setItem('roomId', data.roomId);
                
                // Establecer el código actual del editor
                if (data.editorCode) {
                    setEditorValue(data.editorCode);
                }
            }
            
            // Solicitar lista de salas
            socket.emit('getRooms');
        } 
        else if (data.role === 'estudiante') {
            hideLoginMenu();
            showEditor();
            
            // Mostrar información de la sala
            if (data.roomId) {
                showRoomInfo(data.roomId);
            }
            
            // Establecer el código actual del editor
            if (data.editorCode) {
                setEditorValue(data.editorCode);
            }
        }
        else {
            alert("Error: Rol desconocido recibido del servidor.");
        }
    });

    // Actualización de participantes
    socket.on('updateParticipants', (data) => {
        updateParticipantsList(data.students);
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
    
    // Eventos de gestión de salas
    socket.on('roomCreated', (data) => {
        console.log('Sala creada:', data.room);
        clearCreateRoomForm();
        socket.emit('getRooms');
    });
    
    socket.on('createRoomError', (data) => {
        alert('Error al crear sala: ' + data.message);
    });
    
    socket.on('roomsList', (data) => {
        updateRoomsList(data.rooms);
    });
    
    socket.on('roomsUpdated', () => {
        socket.emit('getRooms');
    });
    
    socket.on('roomDeleted', (data) => {
        const teacherKey = sessionStorage.getItem('teacherKey');
        
        if (teacherKey) {
            // Si es profesor, solo ocultar editor y volver al menu de salas
            console.log('Sala eliminada:', data.roomId);
            hideEditor();
            hideRoomInfo();
            hideParticipantsMenu();
            setEditorValue('');
            showRoomsMenu();
            sessionStorage.removeItem('roomId');
            socket.emit('getRooms');
        } else {
            // Si es estudiante, volver al login
            alert('La sala ' + data.roomId + ' ha sido eliminada por el profesor.');
            hideEditor();
            hideRoomInfo();
            setEditorValue('');
            showLoginMenu();
            
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('roomId');
        }
    });
    
    socket.on('roomDeletedSuccess', (data) => {
        console.log('Sala eliminada:', data.roomId);
        socket.emit('getRooms');
    });
    
    socket.on('deleteRoomError', (data) => {
        alert('Error al eliminar sala: ' + data.message);
    });
    
    socket.on('leftRoom', (data) => {
        console.log('Saliste de la sala:', data.roomId);
        hideEditor();
        hideRoomInfo();
        hideParticipantsMenu();
        setEditorValue('');
        
        const teacherKey = sessionStorage.getItem('teacherKey');
        if (teacherKey) {
            showRoomsMenu();
            sessionStorage.removeItem('roomId');
            socket.emit('getRooms');
        } else {
            showLoginMenu();
            sessionStorage.removeItem('name');
            sessionStorage.removeItem('roomId');
        }
    });
    
    socket.on('leaveRoomError', (data) => {
        alert('Error al salir de la sala: ' + data.message);
    });
}

export { setupSocketEventsHandlers };
