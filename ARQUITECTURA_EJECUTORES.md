# Arquitectura de Ejecutores de Código

## Idea general

Necesito que los usuarios (profesores y estudiantes con permisos) puedan ejecutar el código que escriben en el editor y ver el resultado.

## Problema de seguridad

No puedo ejecutar código directamente en el servidor porque:
- El usuario podría escribir código malicioso
- Podría hacer un bucle infinito y colapsar el servidor
- Podría leer archivos del sistema
- Podría instalar cosas raras

**Solución:** Usar contenedores Docker aislados que se crean y destruyen para cada ejecución mediante Docker-out-of-Docker (DooD).

## Flujo básico

```
1. Usuario escribe código en el editor
2. Usuario pulsa botón "Ejecutar"
3. Frontend envía código + lenguaje al backend por Socket.IO
4. Backend crea un contenedor Docker temporal
5. Backend ejecuta el código dentro del contenedor (con timeout)
6. Backend captura la salida (stdout y stderr)
7. Backend destruye el contenedor
8. Backend devuelve resultado al frontend
9. Frontend muestra el resultado en un panel
```

## Arquitectura de carpetas

```
backend/
  executors/
    executeCode.js       # Función principal que orquesta todo
    dockerRunner.js      # Ejecuta comandos docker
    compilers/
      c.js              # Compilar y ejecutar C
      cpp.js            # Compilar y ejecutar C++
      java.js           # Compilar y ejecutar Java
      python.js         # Ejecutar Python (no necesita compilar)
  handlers/
    codeExecution.js    # Handler de Socket.IO para ejecutar código

docker/
  executors/
    Dockerfile.c        # Imagen para C
    Dockerfile.cpp      # Imagen para C++
    Dockerfile.java     # Imagen para Java
    Dockerfile.python   # Imagen para Python
```

## Imágenes Docker

Cada lenguaje tendrá su propia imagen con:
- Compilador/intérprete instalado
- Usuario sin privilegios (no root)
- Sin acceso a red
- Límites de memoria y CPU

### Python
- Imagen base: python:3.11-slim
- Solo ejecuta el script
- Timeout: 5 segundos

### Java
- Imagen base: openjdk:17-slim
- Compila el archivo .java
- Ejecuta el .class
- Timeout: 10 segundos (compilar + ejecutar)

### C
- Imagen base: gcc:latest
- Compila con gcc
- Ejecuta el binario
- Timeout: 10 segundos

### C++
- Imagen base: gcc:latest (gcc también compila C++)
- Compila con g++
- Ejecuta el binario
- Timeout: 10 segundos

## Límites de seguridad

Para cada ejecución:
- Timeout: 5-10 segundos max
- Memoria: 128MB max (`-m 128m`)
- CPU: 1 core (`--cpus 1`)
- Sin acceso a red (`--network none`)
- Carpeta temporal en memoria (`--tmpfs /tmp:exec`)
- Usuario sin privilegios (UID 1000)
- Archivos de código en modo solo lectura

## Manejo de errores

Posibles casos:
1. **Código compila/ejecuta bien** → Devolver stdout
2. **Error de compilación** → Devolver stderr del compilador
3. **Error de ejecución** → Devolver stderr del programa
4. **Timeout** → Devolver mensaje "Ejecución detenida: tiempo límite excedido"
5. **Memoria excedida** → Devolver mensaje "Error: memoria insuficiente"

## Formato de respuesta

```javascript
{
    success: true/false,
    output: "...",        // stdout si success=true
    error: "...",         // stderr o mensaje de error
    executionTime: 1234   // milisegundos
}
```

## Frontend

- Botón "Ejecutar" junto al selector de lenguaje
- Panel de salida debajo del editor (colapsable)
- Muestra stdout en verde y stderr en rojo
- Loading mientras ejecuta
- Solo el profesor o estudiantes con permisos pueden ejecutar

## Flujo de ejemplo (Python)

```
1. Usuario escribe:
   print("Hola mundo")
   
2. Click en "Ejecutar"

3. Backend crea contenedor:
   docker run --rm --network none -m 128m --cpus 1 \
   -v /tmp/code.py:/app/code.py python-executor python code.py

4. Captura salida: "Hola mundo"

5. Devuelve: { success: true, output: "Hola mundo", executionTime: 45 }

6. Frontend muestra en panel verde: "Hola mundo"
```

## Notas de implementación

- Usar `child_process.spawn` de Node.js para ejecutar docker
- Los archivos temporales se guardan en `/tmp` con nombres únicos (uuid)
- Limpiar archivos temporales después de cada ejecución
- Broadcast del resultado a toda la sala (todos ven la misma salida)
- Añadir console.log para debug en backend

## Limitaciones conocidas

- No soporta entrada de usuario (stdin) - solo ejecución simple
- No soporta múltiples archivos
- No soporta librerías externas (solo stdlib)
- El código debe estar en un solo archivo

## Mejoras futuras (para después del TFG)

- Soportar stdin
- Guardar historial de ejecuciones
- Mostrar uso de memoria/CPU
- Permitir múltiples archivos
- Instalación de librerías (pip, npm, etc)
