## Descripción General

La aplicación se basa en un modelo **cliente-servidor** y está diseñada para permitir la colaboración en tiempo real entre un profesor y los estudiantes dentro de un aula. El profesor controla la edición del código y la asignación del usuario con permisos de escritura, mientras que los estudiantes (siempre y cuando no tengan asignado dicho permiso) únicamente pueden observar los cambios reflejados de manera inmediata en sus pantallas.

---

## Componentes Principales

### 1. **Cliente**

Cada usuario (profesor o estudiante) interactúa con la aplicación a través de un cliente web que contiene:

- Una interfaz de usuario con un editor de código compartido.
- Un menú desplegable que lista a los participantes conectados:
  - El profesor tiene permisos de administración para asignar el control del editor.
  - Los estudiantes solo pueden observar y no tienen permisos de edición.
- Comunicación en tiempo real con el servidor mediante sockets.

### 2. **Servidor**

El servidor actúa como intermediario para:

- Gestionar las conexiones entre los clientes.
- Transmitir los cambios realizados en el editor de código en tiempo real a todos los clientes conectados.
- Controlar los permisos de edición del editor según las acciones del profesor.

El servidor no almacena información de manera persistente.

---

## Tecnologías

- **Frontend**: Implementado con HTML, CSS y JavaScript. Se conecta al servidor mediante sockets para recibir y enviar eventos.
- **Backend**: Desarrollado con Node.js y Socket.IO, que gestiona la lógica de la comunicación en tiempo real.
- **Sockets**: Protocolo para actualizar el estado de la aplicación en tiempo real.

---

## Flujo de Trabajo

1. **Conexión Inicial**:

   - Los clientes se conectan al servidor al iniciar la aplicación.
   - El servidor registra a los participantes (profesor y estudiantes).

2. **Asignación del Control del Editor**:

   - El profesor selecciona a un estudiante desde el menú desplegable.
   - El servidor asigna los permisos de edición al estudiante seleccionado y notifica a todos los clientes.

3. **Edición en Tiempo Real**:

   - El estudiante con permisos realiza cambios en el editor.
   - Los cambios son enviados al servidor mediante sockets y distribuidos a todos los clientes conectados.

4. **Actualización Dinámica**:

   - Los cambios en el editor se reflejan inmediatamente en las pantallas de los participantes.

---

## Esquema de la Arquitectura

```text
[Cliente: Profesor]   <===>   [Servidor Node.js + Socket.IO]   <===>   [Cliente: Estudiantes]
```

- El cliente del profesor y los clientes de los estudiantes se comunican con el servidor en tiempo real.
- El servidor actúa como un canal central para transmitir los datos entre los clientes.

---

## Consideraciones

- No hay persistencia inicial: los datos solo existen mientras la aplicación está en ejecución.
- La comunicación en tiempo real se basa exclusivamente en sockets, lo que permite una baja latencia en las actualizaciones.
- Se prioriza la simplicidad para facilitar futuras mejoras, como la adición de persistencia o seguridad.

