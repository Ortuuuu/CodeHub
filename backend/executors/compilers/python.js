const { runDockerContainer, generateTempFilename, saveTempFile, deleteTempFile } = require('../dockerRunner');

async function executePython(code) {
    console.log('Ejecutando código Python...');
    
    const filename = generateTempFilename('.py');
    let filePath = null;
    
    try {
        filePath = saveTempFile(code, filename);
        
        // El archivo está en /shared-temp dentro del volumen
        const codeFile = `/shared-temp/${filename}`;
        
        const result = await runDockerContainer('python-executor', 5000, codeFile);
        
        return result;
        
    } catch (error) {
        console.error('Error ejecutando Python:', error);
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

module.exports = { executePython };