const { executeCode } = require('../executors/executeCode');
const { getTeacherSocketId, getParticipant } = require('../models/participants');

function handleCodeExecution(socket, io, { code, language, roomId }) {
    console.log(`Petición de ejecución de código en sala ${roomId}`);
    
    const teacherSocketId = getTeacherSocketId();
    const isTeacher = socket.id === teacherSocketId;
    
    const participant = getParticipant(socket.id);
    const hasPerms = participant && participant.hasPermission;
    
    // Obtener el roomId real del participante para evitar que un "estudiante malicioso" intente ejecutar código en otra sala
    const actualRoomId = participant ? participant.currentRoomId : roomId;
    
    console.log(`roomId recibido: ${roomId}, roomId del participante: ${actualRoomId}`);
    
    if (!actualRoomId) {
        console.log('Usuario no está en ninguna sala');
        socket.emit('executionResult', {
            success: false,
            output: '',
            error: 'No estás en ninguna sala',
            executionTime: 0
        });
        return;
    }
    
    // Verificamos ls permisos
    if (!isTeacher && !hasPerms) {
        console.log('Usuario sin permisos intentó ejecutar código');
        socket.emit('executionResult', {
            success: false,
            output: '',
            error: 'No tienes permisos para ejecutar código',
            executionTime: 0
        });
        return;
    }
    
    console.log('Permisos OK, ejecutando código...');
    
    // Verificamos que el socket está en la sala
    const rooms = Array.from(socket.rooms);
    console.log(`Socket ${socket.id} está en las salas:`, rooms);
    console.log(`Vamos a emitir a la sala: ${actualRoomId}`);
    
    executeCode(code, language)
        .then(result => {
            console.log('Ejecución completada, enviando resultado a la sala');
            console.log('Resultado:', JSON.stringify(result));
            
            // Enviar resultado a toda la sala (todos ven el mismo output)
            io.to(actualRoomId).emit('executionResult', result);
            
            console.log(`Evento executionResult emitido a sala ${actualRoomId}`);
        })
        .catch(error => {
            console.error('Error inesperado durante la ejecución:', error);
            
            const errorResult = {
                success: false,
                output: '',
                error: 'Error inesperado: ' + error.message,
                executionTime: 0
            };
            
            io.to(actualRoomId).emit('executionResult', errorResult);
            
            console.log(`Evento executionResult (error) emitido a sala ${actualRoomId}`);
        });
}

module.exports = handleCodeExecution;