const { runDockerContainer, generateTempFilename, saveTempFile, deleteTempFile } = require('../dockerRunner');

async function executeC(code) {
    console.log('Ejecutando código C...');
    
    const filename = generateTempFilename('.c');
    let filePath = null;
    
    try {
        filePath = saveTempFile(code, filename);
        
        // El archivo está en /shared-temp dentro del volumen
        const codeFile = `/shared-temp/${filename}`;
        
        // Timeout 10 segundos (compilar + ejecutar)
        const result = await runDockerContainer('c-executor', 10000, codeFile);
        
        return result;
        
    } catch (error) {
        console.error('Error ejecutando C:', error);
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

module.exports = { executeC };