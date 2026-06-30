# Ejecutores de Código

Esta carpeta contiene las definiciones de las imágenes Docker para ejecutar código de forma segura en contenedores aislados.

---

## Construir las imágenes

Antes de poder ejecutar código, necesitas construir las imágenes Docker:

```powershell
.\build-executors.ps1
```

Esto creará 4 imágenes:
- `python-executor` - Para ejecutar Python 3.11
- `java-executor` - Para compilar y ejecutar Java 17
- `c-executor` - Para compilar y ejecutar C (gcc)
- `cpp-executor` - Para compilar y ejecutar C++ (g++)

---

## Arquitectura Docker-in-Docker

El sistema usa Docker-in-Docker (DinD) para ejecutar código:

```text
[ Docker Host (Windows/WSL) ]
    │
    ├── codehub-backend (container)
    │   ├── Monta: /var/run/docker.sock (acceso al Docker daemon del host)
    │   ├── Monta: ./temp:/shared-temp (archivos temporales)
    │   └── Ejecuta: docker run ... (crea contenedores hermanos)
    │
    └── Ejecutores efímeros (containers)
        ├── python-executor (se crea y destruye por cada ejecución)
        ├── java-executor
        ├── c-executor
        └── cpp-executor
```

**Ventajas:**
- Mayor aislamiento de seguridad
- Fácil escalabilidad horizontal
- Limpieza automática de recursos
- Sin dependencias instaladas en el backend

**Consideraciones:**
- El backend necesita acceso al socket de Docker (`privileged: true`)
- Las rutas de volúmenes se convierten de Windows a WSL automáticamente
- Los ejecutores montan `/shared-temp` en modo solo lectura

---

## Cómo funciona

### Flujo de ejecución

1. Usuario escribe código en el editor y hace click en "Ejecutar"
2. Frontend envía código al backend vía Socket.IO
3. Backend valida permisos del usuario
4. Backend guarda código en archivo temporal:
   - Ruta del host: `./temp/code_<timestamp>_<random>.<ext>`
   - Dentro del backend: `/shared-temp/code_<timestamp>_<random>.<ext>`
5. Backend ejecuta comando Docker:
   ```bash
   docker run --rm --network none -m 128m --cpus 1 \
     -v /mnt/c/Codehub/CodeHub/temp:/shared-temp:ro \
     <executor-image> sh -c "<compile-and-run-command>"
   ```
6. Contenedor ejecutor:
   - Lee el archivo desde `/shared-temp/` (solo lectura)
   - Compila (si es necesario) en `/tmp/` (escribible)
   - Ejecuta el programa
   - Devuelve stdout y stderr
7. Backend captura la salida y tiempo de ejecución
8. Backend elimina el archivo temporal
9. Backend envía resultado a todos los clientes de la sala
10. Frontend muestra resultado en el panel de salida

---

## Medidas de seguridad

Cada contenedor ejecutor tiene las siguientes restricciones:

### Límites de recursos
- **RAM**: Máximo 128MB (`-m 128m`)
- **CPU**: Máximo 1 core (`--cpus 1`)
- **Timeout**: 5-10 segundos según lenguaje
- **Sin swap**: Evita uso de memoria virtual

### Aislamiento de red
- **Sin internet**: `--network none`
- No puede comunicarse con otros contenedores
- No puede acceder a servicios externos

### Sistema de archivos
- **Código fuente**: Solo lectura (`/shared-temp/:ro`)
- **Compilación/ejecución**: Solo `/tmp` es escribible
- Usuario sin privilegios (`USER coderunner`)
- UID/GID 1000:1000 (no root)

### Limpieza automática
- `--rm`: Contenedor se elimina al terminar
- Archivo temporal eliminado por el backend
- No quedan rastros en el sistema

---

## Dockerfiles

### Estructura común

Todos los ejecutores siguen este patrón:

```dockerfile
FROM <base-image>
RUN addgroup --gid 1000 coderunner && \
    adduser --uid 1000 --gid 1000 --disabled-password coderunner
WORKDIR /app
USER coderunner
```

### python-executor (`Dockerfile.python`)
- **Base**: `python:3.11-slim`
- **Comando**: `python /shared-temp/<file>.py`
- **Timeout**: 5 segundos
- Solo ejecuta, no compila

### java-executor (`Dockerfile.java`)
- **Base**: `eclipse-temurin:17-jdk-alpine`
- **Comando**: `javac Codigo.java && java Codigo`
- **Timeout**: 10 segundos
- Compila y ejecuta (requiere clase `Codigo`)

### c-executor (`Dockerfile.c`)
- **Base**: `gcc:latest`
- **Comando**: `gcc /shared-temp/<file>.c -o /tmp/programa && /tmp/programa`
- **Timeout**: 10 segundos
- Compila con gcc y ejecuta

### cpp-executor (`Dockerfile.cpp`)
- **Base**: `gcc:latest`
- **Comando**: `g++ /shared-temp/<file>.cpp -o /tmp/programa && /tmp/programa`
- **Timeout**: 10 segundos
- Compila con g++ y ejecuta

---

## Archivos temporales

### Ubicación
- **Host**: `./temp/` (raíz del proyecto)
- **Backend container**: `/shared-temp/`
- **Executor containers**: `/shared-temp/` (solo lectura)

### Nomenclatura
Formato: `code_<timestamp>_<random>.<extension>`

Ejemplo: `code_1782487389662_5411.c`

### Ciclo de vida
1. Creado antes de ejecutar
2. Montado en el contenedor ejecutor
3. Eliminado inmediatamente después de capturar resultado
4. Máximo 1-2 segundos de existencia

---

## Testing manual

Puedes probar cada ejecutor manualmente para debugging:

### Python
```powershell
# Crear archivo de prueba
echo "print('Hola desde Python')" > temp/test.py

# Ejecutar
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" python-executor python /shared-temp/test.py
```

### Java
```powershell
# Crear archivo de prueba
echo "public class Codigo { public static void main(String[] args) { System.out.println(`"Hola desde Java`"); } }" > temp/Codigo.java

# Ejecutar
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" java-executor sh -c "cp /shared-temp/Codigo.java /tmp/ && cd /tmp && javac Codigo.java && java Codigo"
```

### C
```powershell
# Crear archivo de prueba
@"
#include <stdio.h>
int main() {
    printf("Hola desde C\n");
    return 0;
}
"@ | Out-File -FilePath temp/test.c -Encoding ASCII

# Ejecutar
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" c-executor sh -c "gcc /shared-temp/test.c -o /tmp/programa && /tmp/programa"
```

### C++
```powershell
# Crear archivo de prueba
@"
#include <iostream>
int main() {
    std::cout << "Hola desde C++" << std::endl;
    return 0;
}
"@ | Out-File -FilePath temp/test.cpp -Encoding ASCII

# Ejecutar
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" cpp-executor sh -c "g++ /shared-temp/test.cpp -o /tmp/programa && /tmp/programa"
```

---

## Agregar un nuevo lenguaje

Para añadir soporte para un nuevo lenguaje de programación:

### 1. Crear Dockerfile

Crear `Dockerfile.<lenguaje>` en esta carpeta:

```dockerfile
FROM <base-image>

# Crear usuario sin privilegios
RUN addgroup --gid 1000 coderunner && \
    adduser --uid 1000 --gid 1000 --disabled-password coderunner

WORKDIR /app
USER coderunner

# Instalar dependencias si es necesario
# RUN ...
```

### 2. Actualizar build script

Agregar al archivo `build-executors.ps1`:

```powershell
docker build -t <lenguaje>-executor -f docker/executors/Dockerfile.<lenguaje> .
```

### 3. Crear ejecutor en backend

Crear `backend/executors/compilers/<lenguaje>.js`:

```javascript
const { runDockerContainer, generateTempFilename, saveTempFile, deleteTempFile } = require('../dockerRunner');

async function execute<Lenguaje>(code) {
    const filename = generateTempFilename('.<ext>');
    let filePath = null;
    
    try {
        filePath = saveTempFile(code, filename);
        const codeFile = `/shared-temp/${filename}`;
        const result = await runDockerContainer('<lenguaje>-executor', <timeout>, codeFile);
        return result;
    } catch (error) {
        console.error('Error ejecutando <lenguaje>:', error);
        return { success: false, output: '', error: 'Error interno', executionTime: 0 };
    } finally {
        if (filePath) deleteTempFile(filePath);
    }
}

module.exports = { execute<Lenguaje> };
```

### 4. Registrar en enrutador

Actualizar `backend/executors/executeCode.js`:

```javascript
const { execute<Lenguaje> } = require('./compilers/<lenguaje>');

async function executeCode(code, language) {
    // ...
    switch (language) {
        // ...
        case '<lenguaje>':
            return await execute<Lenguaje>(code);
        // ...
    }
}
```

### 5. Actualizar frontend

Agregar el lenguaje al selector en `frontend/index.html` y asegurar que CodeMirror tenga el paquete de resaltado de sintaxis correspondiente.

---

## Troubleshooting

### Ejecutores no se construyen
```powershell
# Verificar que Docker Desktop está corriendo
docker ps

# Construir manualmente uno por uno
docker build -t python-executor -f docker/executors/Dockerfile.python .
```

### Errores de montaje de volumen
```powershell
# Verificar que la carpeta temp existe
New-Item -ItemType Directory -Force -Path ".\temp"

# Verificar formato de ruta (debe ser formato WSL en el log)
docker logs codehub-backend-1 | Select-String "docker run"
```

### Timeout muy corto
Editar el timeout en el archivo del compilador correspondiente:
```javascript
const result = await runDockerContainer('python-executor', 10000, codeFile); // 10 segundos
```

### Archivo no encontrado
```powershell
# Verificar que el backend puede escribir en /shared-temp
docker exec codehub-backend-1 ls -la /shared-temp

# Verificar que el ejecutor puede leer desde /shared-temp
docker run --rm -v "C:\Codehub\CodeHub\temp:/shared-temp:ro" python-executor ls -la /shared-temp
```
