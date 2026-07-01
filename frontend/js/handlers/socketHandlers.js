import { socket } from '../config.js';
import { showLoginMenu, hideLoginMenu } from '../ui/loginUI.js';
import { showEditor, hideEditor, enableEditor, disableEditor, setEditorValue, showRoomInfo, hideRoomInfo, initializeEditor, showEditorControls, hideEditorControls, setLanguage, displayExecutionResult, setExecuteButtonLoading } from '../ui/editorUI.js';
import { showParticipantsBar, hideParticipantsBar, updateParticipantsList } from '../ui/participantsUI.js';
import { showRoomsMenu, hideRoomsMenu, updateRoomsList, clearCreateRoomForm } from '../ui/roomsUI.js';

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
                hideRoomsMenu();
                showParticipantsBar();
                showEditor();
                showEditorControls();
                
                // Mostrar botón de participantes solo a profesores
                const toggleParticipantsBtn = document.getElementById('toggleParticipantsBtn');
                if (toggleParticipantsBtn) {
                    toggleParticipantsBtn.classList.remove('hidden');
                }
                
                // Inicializar CodeMirror si no está inicializado
                initializeEditor((newContent) => {
                    socket.emit('codeChange', { code: newContent, user: socket.id });
                });
                
                // Habilitar editor después de inicializarlo
                enableEditor();
                
                updateParticipantsList(data.participants || []);
                showRoomInfo(data.roomId);
                sessionStorage.setItem('roomId', data.roomId);
                
                // Establecer el código actual del editor
                if (data.editorCode) {
                    setEditorValue(data.editorCode);
                }
                
                // Establecer el lenguaje
                if (data.language) {
                    setLanguage(data.language);
                    // Actualizar el selector
                    const selector = document.getElementById('languageSelector');
                    if (selector) {
                        selector.value = data.language;
                    }
                }
            }
            
            // Solicitar lista de salas
            socket.emit('getRooms');
        } 
        else if (data.role === 'estudiante') {
            hideLoginMenu();
            showEditor();
            showEditorControls();
            
            // Ocultar botón de participantes para estudiantes
            const toggleParticipantsBtn = document.getElementById('toggleParticipantsBtn');
            if (toggleParticipantsBtn) {
                toggleParticipantsBtn.classList.add('hidden');
            }
            
            // Inicializar CodeMirror si no está inicializado
            initializeEditor((newContent) => {
                socket.emit('codeChange', { code: newContent, user: socket.id });
            });
            
            // Deshabilitar selector de lenguaje para estudiantes
            const languageSelector = document.getElementById('languageSelector');
            if (languageSelector) {
                languageSelector.disabled = true;
            }
            
            // Mostrar información de la sala
            if (data.roomId) {
                showRoomInfo(data.roomId);
            }
            
            // Establecer el código actual del editor
            if (data.editorCode) {
                setEditorValue(data.editorCode);
            }
            
            // Establecer el lenguaje
            if (data.language) {
                setLanguage(data.language);
                // Actualizar el selector (solo visual para estudiantes)
                const selector = document.getElementById('languageSelector');
                if (selector) {
                    selector.value = data.language;
                }
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
    
    // Cambio de lenguaje sincronizado por el profesor
    socket.on('languageChanged', (data) => {
        console.log('Lenguaje cambiado a:', data.language);
        setLanguage(data.language);
        // Actualizar el selector
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = data.language;
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
            hideEditorControls();
            hideRoomInfo();
            hideParticipantsBar();
            setEditorValue('');
            showRoomsMenu();
            sessionStorage.removeItem('roomId');
            socket.emit('getRooms');
        } else {
            // Si es estudiante, volver al login
            alert('La sala ' + data.roomId + ' ha sido eliminada por el profesor.');
            
            // Limpiar el sessionStorage para evitar reconexiones automáticas
            sessionStorage.clear();
            
            // Limpiar interfaz
            hideEditor();
            hideEditorControls();
            hideRoomInfo();
            setEditorValue('');
            
            // Mostrar menú de login limpio
            showLoginMenu();
            
            // Vaciar los campos del formulario
            document.getElementById('nameInput').value = '';
            document.getElementById('teacherKeyInput').value = '';
            document.getElementById('roomIdInput').value = '';
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
        hideEditorControls();
        hideRoomInfo();
        hideParticipantsBar();
        setEditorValue('');
        
        const teacherKey = sessionStorage.getItem('teacherKey');
        if (teacherKey) {
            showRoomsMenu();
            sessionStorage.removeItem('roomId');
            socket.emit('getRooms');
        } else {
            // Estudiante sale de la sala ->. limpiar todo
            sessionStorage.clear();
            
            // Mostrar menú de login limpio
            showLoginMenu();
            
            // Vaciar los campos del formulario
            document.getElementById('nameInput').value = '';
            document.getElementById('teacherKeyInput').value = '';
            document.getElementById('roomIdInput').value = '';
        }
    });
    
    socket.on('leaveRoomError', (data) => {
        alert('Error al salir de la sala: ' + data.message);
    });
    
    // Resultado dee la ejecución del código
    socket.on('executionResult', (result) => {
        console.log('Resultado de ejecución recibido:', result);
        setExecuteButtonLoading(false);
        displayExecutionResult(result);
    });
}

export { setupSocketEventsHandlers };