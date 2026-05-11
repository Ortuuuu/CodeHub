import { socket } from '../config.js';
import { getLoginCredentials, validateName } from '../ui/loginUI.js';
import { setLanguage, toggleTheme, getEditorValue } from '../ui/editorUI.js';
import { toggleStudentPermissionClass } from '../ui/participantsUI.js';
import { getCreateRoomData } from '../ui/roomsUI.js';

function setupDOMHandlers() {
    // Botón de unirse
    document.getElementById('joinBtn').onclick = () => {
        console.log("Intentando unirse a la sala...");

        const { name, teacherKey, roomId } = getLoginCredentials();

        if (!validateName(name)) return;

        socket.emit('joinRoom', { name, teacherKey, roomId });

        sessionStorage.setItem('name', name);
        sessionStorage.setItem('teacherKey', teacherKey);
        sessionStorage.setItem('roomId', roomId || '');
    };

    // Selector de lenguaje
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.onchange = (event) => {
            const language = event.target.value;
            console.log('Cambiando lenguaje a:', language);
            setLanguage(language);
            
            // Si es profesor, notificar al servidor para sincronizar
            const teacherKey = sessionStorage.getItem('teacherKey');
            if (teacherKey) {
                const roomId = sessionStorage.getItem('roomId');
                socket.emit('languageChange', { language, roomId });
            }
        };
    }

    // Botón de cambio de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            console.log('Cambiando tema');
            toggleTheme();
        };
    }

    // Botón de descarga de código
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            console.log('Descargando código');
            downloadCode();
        };
    }

    // Botón de revocar permisos
    document.getElementById('revokeAllBtn').onclick = () => {
        console.log("Eliminando permisos de todos los estudiantes");
        const roomId = sessionStorage.getItem('roomId');
        socket.emit('togglePermissions', { target: 'all', give: false, roomId: roomId });
    };

    // Cuando el profesor le da permisos a un estudiante (clicándolo en el menú de participantes)
    document.getElementById('participantsList').onclick = (event) => {
        if (event.target && event.target.tagName === 'LI') {
            const studentId = event.target.dataset.id;
            const currentlyHasPermission = event.target.classList.contains('has-permission');
            const roomId = sessionStorage.getItem('roomId');

            console.log(`Cambiando permisos del estudiante ${studentId}. Actualmente tiene permisos ${currentlyHasPermission}, y se van a establecer a ${!currentlyHasPermission}`);
            socket.emit('togglePermissions', { 
                target: studentId, 
                give: !currentlyHasPermission,
                roomId: roomId
            });

            /**@todo: Esto es solo el prototipo. En la versión final el servidor debe confirmar el cambio */
            toggleStudentPermissionClass(event.target);
        }
    };
    
    // Botón de crear sala
    const createRoomBtn = document.getElementById('createRoomBtn');
    if (createRoomBtn) {
        createRoomBtn.onclick = () => {
            const { roomId, code } = getCreateRoomData();
            
            if (!roomId || roomId.trim() === '') {
                alert('Debes proporcionar un ID para la sala');
                return;
            }
            
            console.log('Creando sala:', roomId);
            socket.emit('createRoom', { roomId, code });
        };
    }
    
    // Delegación de eventos para botones de salas
    const roomsList = document.getElementById('roomsList');
    if (roomsList) {
        roomsList.onclick = (event) => {
            const target = event.target;
            
            // Botón de entrar a sala
            if (target.classList.contains('enter-room-btn')) {
                const roomId = target.dataset.roomId;
                console.log('Entrando a sala:', roomId);
                
                const name = sessionStorage.getItem('name');
                const teacherKey = sessionStorage.getItem('teacherKey');
                
                if (name && teacherKey) {
                    socket.emit('joinRoom', { name, teacherKey, roomId });
                    sessionStorage.setItem('roomId', roomId);
                }
            }
            
            // Botón de eliminar sala
            if (target.classList.contains('delete-room-btn')) {
                const roomId = target.dataset.roomId;
                
                if (confirm('¿Estás seguro de que quieres eliminar la sala "' + roomId + '"?')) {
                    console.log('Eliminando sala:', roomId);
                    socket.emit('deleteRoom', { roomId });
                }
            }
        };
    }
    
    // Botón de salir de sala
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    if (leaveRoomBtn) {
        leaveRoomBtn.onclick = () => {
            if (confirm('¿Estás seguro de que quieres salir de esta sala?')) {
                console.log('Saliendo de la sala');
                socket.emit('leaveRoom');
            }
        };
    }
}

// Función para descargar el código del editor
function downloadCode() {
    const code = getEditorValue();
    
    // Obtenemos el lenguaje actual 
    const languageSelector = document.getElementById('languageSelector');
    const language = languageSelector ? languageSelector.value : 'c';
    
    // Seleccionamos la extension y el nombre del archivo (genérico de momento)
    let extension = '.txt';
    let filename = 'codigo';
    
    if (language === 'c') {
        extension = '.c';
        filename = 'codigo';
    } else if (language === 'cpp') {
        extension = '.cpp';
        filename = 'codigo';
    } else if (language === 'java') {
        extension = '.java';
        filename = 'Codigo'; // Java usa mayuscula inicial porque tiene que coincidir con la clase
    } else if (language === 'python') {
        extension = '.py';
        filename = 'codigo';
    }
    
    const fullFilename = filename + extension;
    
    // Creamos el archivo y lo descargamos
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fullFilename;
    document.body.appendChild(a);
    a.click();
    
    // Limpiamos estos elememntos temporales
    document.body.removeChild(a);
    console.log('Archivo descargado: ', fullFilename);
}

export { setupDOMHandlers };
