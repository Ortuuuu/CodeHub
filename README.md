# CodeHub

## Descripción General

CodeHub es una aplicación **cliente-servidor** diseñada para facilitar la colaboración en tiempo real dentro de un entorno educativo.  
El **profesor** controla el editor de código y puede otorgar o revocar permisos de escritura a los estudiantes, quienes por defecto acceden en modo observador y visualizan los cambios de manera inmediata.

---

## Componentes Principales

### 1. **Cliente (Frontend)**

Cada usuario (profesor o estudiante) accede a través de una interfaz web ligera que incluye:

- **Editor de código compartido** en tiempo real.
- **Panel de participantes**:
  - El profesor puede otorgar o revocar permisos de edición.
  - Los estudiantes visualizan su estado pero no administran permisos.
- Comunicación con el servidor mediante **WebSockets (Socket.IO)**.

### 2. **Servidor (Backend)**

El servidor centraliza la comunicación y es responsable de:

- Gestionar las **conexiones y desconexiones** de clientes.
- Distribuir en tiempo real los cambios del editor.
- Mantener los roles y permisos activos durante la sesión.
- Validar que únicamente el profesor pueda modificar permisos.

> Actualmente, el servidor **no almacena datos de forma persistente** (los datos se pierden al reiniciar la aplicación).

---

## Tecnologías Utilizadas

- **Frontend** → HTML5, CSS, JavaScript (vanilla).
- **Backend** → Node.js + Express + Socket.IO.
- **Comunicación** → WebSockets (Socket.IO).
- **Infraestructura** → Docker + Docker Compose.

---

## Flujo de Trabajo

1. **Conexión inicial**  
   - Los clientes se conectan al servidor.  
   - El servidor asigna roles (profesor o estudiante).  

2. **Gestión de permisos**  
   - El profesor puede otorgar permisos a los estudiantes.  
   - El servidor actualiza los permisos y notifica a los clientes.  

3. **Edición en tiempo real**  
   - Solo quien tiene permisos puede editar.  
   - Los cambios se propagan inmediatamente al resto de clientes.  

4. **Sincronización dinámica**  
   - Todos los participantes ven los cambios de forma instantánea.  

---

## Esquema de Arquitectura

```text
[ Cliente: Profesor ]  <====>  [ Servidor Node.js + Socket.IO ]  <====>  [ Cliente: Estudiantes ]
El profesor administra roles y permisos.

Los estudiantes observan (o editan si se les concede).

El servidor actúa como intermediario único.

  Consideraciones:
Los datos no persisten entre ejecuciones (no hay base de datos aún).

El sistema prioriza baja latencia mediante WebSockets.

Arquitectura simple, pensada para ser extendida:

Persistencia con base de datos.

Autenticación real y gestión segura de credenciales.
```