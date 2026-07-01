# CodeHub

## Descripción General

CodeHub es una aplicación **cliente-servidor** diseñada para facilitar la colaboración en tiempo real dentro de un entorno educativo.  
El **profesor** controla el editor de código y puede otorgar o revocar permisos de escritura a los estudiantes, quienes por defecto acceden en modo observador y visualizan los cambios de manera inmediata.

### Funcionalidades principales:

- **Edición colaborativa en tiempo real** con CodeMirror 6
- **Gestión de permisos** por el profesor
- **Ejecución de código** en Python, Java, C y C++ de forma segura en contenedores Docker
- **Salas de trabajo** con códigos de acceso opcionales
- **Sincronización instantánea** mediante WebSockets

---

## Instalación y Ejecución

### Requisitos previos

- Docker Desktop instalado y en ejecución
- PowerShell (Windows)

### Pasos de instalación

1. **Clonar el repositorio:**
   ```powershell
   git clone <url-del-repo>
   cd CodeHub
   ```

2. **Crear archivo `.env`** en la raíz del proyecto:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

3. **Construir imágenes de ejecutores:**
   ```powershell
   .\build-executors.ps1
   ```
   Esto crea las imágenes Docker para Python, Java, C y C++.

4. **Levantar la aplicación:**
   ```powershell
   $env:PWD = (Get-Location).Path
   docker-compose up -d --build
   ```

5. **Acceder a la aplicación:**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3000

### Comandos útiles

**Levantar (con rebuild):**
```powershell
$env:PWD = (Get-Location).Path
docker-compose up -d --build
```

**Levantar (sin rebuild):**
```powershell
$env:PWD = (Get-Location).Path
docker-compose up -d
```

**Tumbar:**
```powershell
docker-compose down
```

**Ver logs en tiempo real:**
```powershell
docker-compose logs -f
docker-compose logs -f backend  # Solo backend
```

**Reiniciar solo backend:**
```powershell
$env:PWD = (Get-Location).Path
docker-compose up -d --build backend
```

> **Nota:** Es necesario establecer `$env:PWD` antes de ejecutar `docker-compose up` para que los volúmenes se monten correctamente en el sistema Docker-in-Docker.

---

## Componentes Principales

### 1. **Cliente (Frontend)**

Interfaz web construida con Vite y CodeMirror 6 que incluye:

- **Editor de código compartido** con resaltado de sintaxis para múltiples lenguajes
- **Panel de participantes** con gestión de permisos
- **Botón de ejecución** para ejecutar código directamente desde el editor
- **Panel de salida** que muestra resultados de ejecución
- Comunicación en tiempo real mediante **WebSockets (Socket.IO)**

**Tecnologías:**
- Vite (bundler)
- CodeMirror 6 (editor)
- Socket.IO Client
- Vanilla JavaScript (módulos ES6)

### 2. **Servidor (Backend)**

Servidor Node.js responsable de:

- Gestionar **conexiones WebSocket** y sincronización en tiempo real
- Distribuir cambios del editor a todos los participantes
- **Validar permisos** antes de ejecutar código
- **Orquestar ejecución de código** en contenedores Docker aislados
- Mantener estado de salas y participantes en memoria

**Tecnologías:**
- Node.js 18
- Express 5
- Socket.IO 4
- Docker SDK (para Docker-in-Docker)

### 3. **Ejecutores de Código**

Sistema de contenedores Docker para ejecutar código de forma segura:

- **Python** (python:3.11-slim)
- **Java** (eclipse-temurin:17-jdk-alpine)
- **C** (gcc:latest)
- **C++** (gcc:latest con g++)

**Medidas de seguridad:**
- Sin acceso a internet (`--network none`)
- Límite de RAM: 128MB
- Límite de CPU: 1 core
- Timeout: 5-10 segundos según lenguaje
- Usuario sin privilegios
- Sistema de archivos de solo lectura (excepto /tmp)

> El servidor **no almacena datos de forma persistente**. Los datos se pierden al reiniciar la aplicación.

---

## Arquitectura

### Flujo de colaboración en tiempo real

```text
[ Cliente: Profesor ]  <====>  [ Servidor Node.js + Socket.IO ]  <====>  [ Cliente: Estudiantes ]
       |                                      |                                    |
   Edita código                      Sincroniza cambios                   Ve cambios
   Gestiona permisos                 Valida acciones                      (Edita si tiene permisos)
```

### Flujo de ejecución de código

```text
1. Usuario click "Ejecutar"
   ↓
2. Frontend → Socket.IO → Backend (valida permisos)
   ↓
3. Backend guarda código en /shared-temp/code_XXX.ext
   ↓
4. Backend ejecuta: docker run -v HOST_PATH:/shared-temp:ro <executor>
   ↓
5. Contenedor compila/ejecuta código
   ↓
6. Backend captura stdout/stderr
   ↓
7. Backend elimina archivo temporal
   ↓
8. Backend → Socket.IO → Todos los clientes en la sala
   ↓
9. Frontend muestra resultado en panel de salida
```

### Arquitectura Docker-in-Docker

```text
[ Docker Host (Windows) ]
    │
    ├── Container: codehub-backend
    │   ├── Monta: /var/run/docker.sock (acceso al Docker host)
    │   ├── Monta: ./temp:/shared-temp (archivos temporales)
    │   └── Ejecuta: docker run ... (crea contenedores hermanos)
    │
    ├── Container: codehub-frontend
    │   └── Sirve: Archivos estáticos en puerto 8080
    │
    └── Containers efímeros: python-executor, java-executor, c-executor, cpp-executor
        └── Se crean y destruyen por cada ejecución de código
```

---

## Estructura del Proyecto

```
CodeHub/
├── backend/
│   ├── server.js                 # Punto de entrada
│   ├── config/
│   │   └── constants.js          # Constantes y configuración
│   ├── executors/
│   │   ├── dockerRunner.js       # Lógica de Docker-in-Docker
│   │   ├── executeCode.js        # Enrutador de lenguajes
│   │   └── compilers/
│   │       ├── python.js         # Ejecutor Python
│   │       ├── java.js           # Ejecutor Java
│   │       ├── c.js              # Ejecutor C
│   │       └── cpp.js            # Ejecutor C++
│   ├── handlers/
│   │   ├── codeExecution.js      # Handler de ejecución
│   │   ├── codeChange.js         # Sincronización de código
│   │   ├── createRoom.js         # Crear salas
│   │   ├── joinRoom.js           # Unirse a salas
│   │   └── ...                   # Otros handlers
│   ├── models/
│   │   ├── rooms.js              # Estado de salas
│   │   └── participants.js       # Estado de participantes
│   └── utils/
│       └── helpers.js            # Utilidades
├── frontend/
│   ├── index.html                # HTML principal
│   ├── styles.css                # Estilos
│   ├── js/
│   │   ├── main.js               # Punto de entrada
│   │   ├── config.js             # Configuración Socket.IO
│   │   ├── editor/
│   │   │   └── editorCodeMirror.js
│   │   ├── handlers/
│   │   │   ├── socketHandlers.js # Eventos Socket.IO
│   │   │   └── domHandlers.js    # Eventos del DOM
│   │   └── ui/
│   │       ├── editorUI.js       # UI del editor y salida
│   │       ├── loginUI.js        # UI de login
│   │       ├── participantsUI.js # UI de participantes
│   │       └── roomsUI.js        # UI de salas
│   └── vite.config.js            # Configuración Vite
├── docker/
│   └── executors/
│       ├── Dockerfile.python     # Imagen Python
│       ├── Dockerfile.java       # Imagen Java
│       ├── Dockerfile.c          # Imagen C
│       └── Dockerfile.cpp        # Imagen C++
├── temp/                         # Archivos temporales (creado en runtime)
├── docker-compose.yml            # Orquestación de servicios
├── Dockerfile-backend            # Imagen del backend
├── Dockerfile-frontend           # Imagen del frontend
├── build-executors.ps1           # Script para construir ejecutores
└── README.md                     # Este archivo
```

---

## Consideraciones Técnicas

### Docker-in-Docker

El backend necesita acceso al socket de Docker del host para crear contenedores ejecutores. Esto se logra mediante:

1. **Montaje del socket:** `/var/run/docker.sock:/var/run/docker.sock`
2. **Modo privilegiado:** `privileged: true`
3. **Conversión de rutas:** Las rutas de Windows se convierten automáticamente a formato WSL (`C:\...` → `/mnt/c/...`)

### Archivos Temporales

Los archivos de código se guardan temporalmente en `./temp/` con nombres únicos:
- Formato: `code_<timestamp>_<random>.<ext>`
- Se eliminan automáticamente después de cada ejecución
- Esta carpeta está ignorada en `.gitignore`

### Persistencia

**No hay persistencia de datos.** Todo el estado (salas, participantes, código) se mantiene en memoria y se pierde al reiniciar el servidor.

Para desarrollo futuro se podría implementar:
- Base de datos para salas y usuarios
- Almacenamiento de historial de código
- Recuperación de sesiones

---

## Desarrollo

### Agregar soporte para un nuevo lenguaje

1. Crear `Dockerfile.<lenguaje>` en `docker/executors/`
2. Añadir al script `build-executors.ps1`
3. Crear `backend/executors/compilers/<lenguaje>.js`
4. Registrar en `backend/executors/executeCode.js`
5. Añadir a la lista de lenguajes del selector en el frontend

### Debugging

**Ver logs del backend:**
```powershell
docker-compose logs -f backend
```

**Ejecutar comando dentro del backend:**
```powershell
docker exec codehub-backend-1 <comando>
```

**Inspeccionar archivos temporales:**
```powershell
docker exec codehub-backend-1 ls -la /shared-temp
```

**Probar ejecución manual:**
```powershell
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" c-executor sh -c "gcc /shared-temp/test.c -o /tmp/programa && /tmp/programa"
```

---

## Seguridad

### Ejecución de código

- Contenedores aislados sin acceso a red
- Límites estrictos de recursos (CPU, RAM, tiempo)
- Sin privilegios de root
- Sistema de archivos de solo lectura
- Archivos temporales eliminados después de cada ejecución

### WebSockets

- Validación de permisos en el servidor antes de ejecutar código
- Solo el profesor puede modificar permisos
- Cada acción se valida contra el estado del servidor

### Consideraciones futuras

- Implementar autenticación de usuarios
- Rate limiting para ejecuciones de código
- Logging de todas las ejecuciones
- Sandboxing adicional (seccomp, AppArmor)