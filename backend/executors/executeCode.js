const { executePython } = require('./compilers/python');
const { executeJava } = require('./compilers/java');
const { executeC } = require('./compilers/c');
const { executeCpp } = require('./compilers/cpp');

async function executeCode(code, language) {
    console.log(`Ejectando código en lenguaje: ${language}`);
    
    // Validación de que hay código
    if (!code || code.trim() === '') {
        return {
            success: false,
            output: '',
            error: 'No hay código para ejecutar',
            executionTime: 0
        };
    }
    
    let result;
    
    if (language === 'python') {
        result = await executePython(code);
    } else if (language === 'java') {
        result = await executeJava(code);
    } else if (language === 'c') {
        result = await executeC(code);
    } else if (language === 'cpp') {
        result = await executeCpp(code);
    } else {
        // Lenguaje no soportado actualmente (aunque no deberia saltar nunca por el front)
        result = {
            success: false,
            output: '',
            error: `Lenguaje no soportado: ${language}`,
            executionTime: 0
        };
    }
    
    console.log('Resultado de ejecución:', result.success ? 'OKAYSSSSSSSSSSS' : 'ERROR');
    
    return result;
}

module.exports = { executeCode };