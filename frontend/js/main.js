import { setupSocketEventsHandlers } from './handlers/socketHandlers.js';
import { setupDOMHandlers } from './handlers/domHandlers.js';

// Inicializar la aplicación
setupSocketEventsHandlers();
setupDOMHandlers();

console.log('Frontal de CodeHub inicializado');
