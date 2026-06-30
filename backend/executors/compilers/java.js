const { runDockerContainer, generateTempFilename, saveTempFile, deleteTempFile } = require('../dockerRunner');

// IMPORTANTE -> en Java el nombre del archivo tiene que coincidir exactamente con el nombre de la clase
async function executeJava(code) {
    console.log('Ejecutando código Java...');
    
    // Para Java el archivo siempre se llama Codigo.java (la clase del editor se deberá llamar también así)
    const filename = 'Codigo.java';
    let filePath = null;
    
    try {
        filePath = saveTempFile(code, filename);
        
        // El archivo está en /shared-temp dentro del volumen
        const codeFile = `/shared-temp/Codigo.java`;
        
        // timeout 10 segundos porque hay que compilar ademas de ejecutar
        const result = await runDockerContainer('java-executor', 10000, codeFile);
        
        return result;
        
    } catch (error) {
        console.error('Error ejecutando Java:', error);
        return {
            success: false,
            output: '',
            error: 'Error interno al ejecutar el código: ' + error.message,
            executionTime: 0
        };
    } finally {
        if (filePath) {
            deleteTempFile(filePath);
        }
    }
}

module.exports = { executeJava };