const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8080", //FRONTEND
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Servidor de sockets escuchando en el puerto: ${PORT}`);
});

const participants = {};    // Objeto: [socket.id] -> { name, role, hasPermission }
const TEACHER_KEY = "clave-de-profesor"; // SOLO PARA EL PROTOTIPO, HAY QUE REFINAR ESTO
let teacherSocketId = null; // Se guardara el id del profesor para que solo haya uno

function connectionTimeout(socket) {
    // Para evitar inconsistencias eliminamos conexiones que no se hayan autenticado en 20 segundos
    setTimeout(() => {
        if (!participants[socket.id]) {
            console.log(`Eliminando conexión no autenticada: ${socket.id}`);
            socket.disconnect(true);
        }
    }, 20000);
};

io.on('connection', (socket) => {
    console.log(`Nueva conexión: ${socket.id}`);
    connectionTimeout(socket);

    socket.on('joinRoom', ({ name, teacherKey }) => {
        clearTimeout(connectionTimeout);
        // En primer lugar asignamos un rol al usuario
        const isTeacher = (teacherKey !== '' && teacherKey === TEACHER_KEY);
        const role = isTeacher ? 'profesor' : 'estudiante';
        
        // Manejamos el caso de que ya haya un profesor conectado
        if (isTeacher) {
            if(teacherSocketId) {
                console.log("Otro profesor intentó unirse. RECHAZADO. Ya hay un profesor conectado.");
                socket.emit('joined', { error: "Ya hay un profesor en la sala." });
                return;
            }
            else {
                teacherSocketId = socket.id;
            }
        }

        // Se establecen los permisos iniciales
        let hasPermission = false;
        if (role === 'profesor') hasPermission = true;

        // Guardamos la info del usuario en la lista de participantes 
        participants[socket.id] = { name, role, hasPermission };
        console.log(`${name} se ha unido como ${role}, con ID ${socket.id} y con permisos: ${hasPermission}`);

        // Eenviamos la confirmacion al cliente confirmando su rol y la lista inicial si es profe
        const personalData = { role: role };

        if (role === 'profesor') {
            const currentParticipants = [];

            for (let id in participants) {
                const client = participants[id];
                // Solo añadimos a los estudiantes en la lista
                if(client.role === 'estudiante') currentParticipants.push({ id: id, name: client.name, hasPermission: client.hasPermission });
            }

            personalData.participants = currentParticipants;
        }
        socket.emit('joined', personalData);

        // Acutalizamos la lista del profesor
        if (role === 'estudiante' && teacherSocketId) {
            let currentParticipants = [];

             for (const id in participants) {
                const client = participants[id];
                if (client.role === 'estudiante') currentParticipants.push({ id: id, name: client.name, hasPermission: client.hasPermission });
            }

            io.to(teacherSocketId).emit('updateParticipants', currentParticipants); 
        }
    });

    socket.on('disconnect', () => {
        // VULNERABILIDAD
        const user = participants[socket.id];
        if (!user) {
            return console.log("Cliente inconsistente desconectado, no estaba en la lista de participantes.");
        }

        console.log(`Cliente ${socket.id} desconectado. (Nombre: ${participants[socket.id].name})`);

        // Si se desconecta el profesor, reseteamos el id
        if (socket.id === teacherSocketId) {
            teacherSocketId = undefined;
            console.log("El usuario que se ha desconectado era el profesor.");
        }

        delete participants[socket.id];

        // Actualizamos la lista del profesor
        if (teacherSocketId) {
            const currentParticipants = [];
            for (let id in participants) {
                const client = participants[id];
                if (client.role === 'estudiante') currentParticipants.push({ id: id, name: client.name, hasPermission: client.hasPermission});
            }
            io.to(teacherSocketId).emit('updateParticipants', currentParticipants);
        }        
    });

    
    socket.on('codeChange', ({ code, user }) => {
        for(let id in participants) {
            if (id !== user) io.to(id).emit('serverCodeUpdate', code);
        }
    });

    socket.on('togglePermissions', ({ target, give }) => {
        if (socket.id !== teacherSocketId) return console.log("Un usuario que no es profesor intentó cambiar permisos."); 
        else if (target === teacherSocketId) return console.log("El profesor no puede cambiar sus propios permisos.");
        else if (target === 'all') {
            console.log("El profesor le ha quitado los permisos a todos los estudiantes.");
            for (let id in participants) {
                if (participants[id].role === 'estudiante') {
                    participants[id].hasPermission = give;
                    io.to(id).emit('permissionChanged', give);
                }
            }

            // Actualizamos la lista del profesor
            if (teacherSocketId) {
                const currentParticipants = [];
                for (let id in participants) {
                    const client = participants[id];
                    if (client.role === 'estudiante') currentParticipants.push({ id: id, name: client.name, hasPermission: client.hasPermission});
                }
                io.to(teacherSocketId).emit('updateParticipants', currentParticipants);
            }        
        }
        else {
            console.log(`El profesor le ha ${give ? 'dado' : 'quitado'} los permisos al estudiante ${participants[target].name}.`);
            participants[target].hasPermission = give;
            io.to(target).emit('permissionChanged', give);
        }

    });
});
