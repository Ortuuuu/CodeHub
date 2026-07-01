const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Función para ejecutar un comando docker y capturar la salida
// Devuelve una promesa que se resuelve con el resultado
function runDockerContainer(imageName, timeout = 5000, codeFile = '/shared-temp/code.c') {
    return new Promise((resolve, reject) => {
        console.log(`Ejecutando contenedor: ${imageName}`);
        
        const ext = codeFile.split('.').pop();
        let cmd = '';
        
        if (imageName.includes('python')) {
            cmd = `python ${codeFile}`;
        } else if (imageName.includes('java')) {
            cmd = `cp ${codeFile} /tmp/Codigo.java && cd /tmp && javac Codigo.java && java Codigo`;
        } else if (imageName.includes('cpp')) {
            cmd = `g++ ${codeFile} -o /tmp/programa && /tmp/programa`;
        } else if (imageName.includes('c-executor')) {
            cmd = `gcc ${codeFile} -o /tmp/programa && /tmp/programa`;
        }
        
        let hostTempPath = process.env.HOST_TEMP_PATH || '/temp';
        
        // Convertir ruta de Windows a formato WSL si es necesario. Por ejemplo: C:\Codehub\CodeHub/temp -> /mnt/c/Codehub/CodeHub/temp
        if (hostTempPath.match(/^[A-Z]:\\/i)) {
            const drive = hostTempPath[0].toLowerCase();
            const pathWithoutDrive = hostTempPath.substring(2).replace(/\\/g, '/');
            hostTempPath = `/mnt/${drive}${pathWithoutDrive}`;
        }
        
        const volumeMount = `${hostTempPath}:/shared-temp:ro`;
        
        // límites de seguridad que se aplicaran al contenedor ejecutor (DooD)
        const dockerArgs = [
            'run',
            '--rm',
            '--network', 'none',  // no acceso a internet
            '-m', '128m',         // max 128MB de RAM
            '--cpus', '1',        // max 1 CPU
            '-v', volumeMount,    // montar carpeta temporal del host
            '--tmpfs', '/tmp:exec',  // Carpeta temporal en memoria (:exec para permitir ejecutar)
            imageName,
            'sh', '-c', cmd            // ejecutar comando personalizado
        ];
        
        console.log('docker ' + dockerArgs.join(' '));
        
        const startTime = Date.now();
        let stdout = '';
        let stderr = '';
        let killed = false;
        
        // Ejecutamos docker
        const dockerProcess = spawn('docker', dockerArgs);
        
        // Capturamos del stdout
        dockerProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        // Capturamos del stderr
        dockerProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        // Timeout de 5segundos por defecfot
        const timeoutId = setTimeout(() => {
            console.log('Timeout alcanzado, matando proceso');
            killed = true;
            dockerProcess.kill('SIGKILL'); // se mata de forma forzosa al prceso
        }, timeout);
        
        // Cuando termina:
        dockerProcess.on('close', (code) => {
            clearTimeout(timeoutId);
            const executionTime = Date.now() - startTime;
            
            console.log(`Proceso terminado con código ${code} en ${executionTime}ms`);
            
            if (killed) {
                resolve({
                    success: false,
                    output: '',
                    error: 'Ejecución detenida: tiempo límite excedido',
                    executionTime
                });
            } else if (code === 0) {
                // Todo ok
                resolve({
                    success: true,
                    output: stdout,
                    error: stderr,
                    executionTime
                });
            } else {
                // Error de compilación o ejecución
                resolve({
                    success: false,
                    output: stdout,
                    error: stderr || 'Error desconocido',
                    executionTime
                });
            }
        });
        
        // Error al ejecutar docker
        dockerProcess.on('error', (err) => {
            clearTimeout(timeoutId);
            reject(new Error('Error al ejecutar Docker: ' + err.message));
        });
    });
}

// Generar un nombre único para archivos temporales
function generateTempFilename(extension) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `code_${timestamp}_${random}${extension}`;
}

// Guardar código en un archivo temporal
function saveTempFile(code, filename) {
    // Path absoluto que coincide con el volumen montado en docker-compose
    const tempDir = '/shared-temp';
    
    // Crear carpeta temp si no existe
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, code, 'utf8');
    
    console.log('Archivo temporal creado:', filePath);
    return filePath;
}

// Eliminar archivo temporal
function deleteTempFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Archivo temporal eliminado:', filePath);
        }
    } catch (err) {
        console.error('Error al eliminar archivo temporal:', err);
    }
}

module.exports = {
    runDockerContainer,
    generateTempFilename,
    saveTempFile,
    deleteTempFile
};