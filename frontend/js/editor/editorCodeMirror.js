import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

// Temas
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';

// Lenguajes soportados: C, C++, Java, Python
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

// Permiten cambiar configuración del editor sin tener que rehacerlo (https://codemirror.net/docs/guide/#dynamic-configuration)
const languageCompartment = new Compartment();
const themeCompartment = new Compartment();
const editableCompartment = new Compartment();

// Lenguajes soportados: C, C++, Java, Python
const languages = {
    c: () => cpp(),       // C y C++
    cpp: () => cpp(),
    java: () => java(),
    python: () => python()
};

let editorView = null;
let currentLanguage = 'c';
let isDarkTheme = true;
let isReceivingUpdate = false; // Para evitar bucle infinito al sincronizar con servidor

function loadThemePreference() {
    const saved = localStorage.getItem('codehub-theme');
    if (saved === 'light') {
        isDarkTheme = false;
    }
}

function saveThemePreference() {
    localStorage.setItem('codehub-theme', isDarkTheme ? 'dark' : 'light');
}

function getCurrentTheme() {
    return isDarkTheme ? githubDark : githubLight;
}

export function createEditor(parentElement, onChange) {
    loadThemePreference();
    
    const startState = EditorState.create({
        doc: '', // El editor añl principio se crea vacio y luego ya se carga el codigo de la sala desde el server
        extensions: [
            basicSetup, // (line numbers, brackets, etc)
            keymap.of(defaultKeymap),
            languageCompartment.of(languages[currentLanguage]()),
            themeCompartment.of(getCurrentTheme()),
            editableCompartment.of(EditorView.editable.of(false)), // deshabilitado por defecto
            EditorView.updateListener.of((update) => {
                //  isReceivingUpdate evita que cambios remotos se reenvíen
                if (update.docChanged && !isReceivingUpdate && onChange) {
                    onChange(update.state.doc.toString());
                }
            })
        ]
    });
    
    editorView = new EditorView({
        state: startState,
        parent: parentElement
    });
    
    return editorView;
}

export function setLanguage(languageName) {
    if (!editorView) return;
    if (!languages[languageName]) {
        console.warn(`Lenguaje no soportado: ${languageName}`);
        return;
    }
    
    currentLanguage = languageName;
    // Reconfiguro el compartment en lugar de rehacer todo el editor
    editorView.dispatch({
        effects: languageCompartment.reconfigure(languages[languageName]())
    });
}

export function toggleTheme() {
    if (!editorView) return;
    
    isDarkTheme = !isDarkTheme;
    saveThemePreference(); // Lo guardo para la próxima vez
    
    editorView.dispatch({
        effects: themeCompartment.reconfigure(getCurrentTheme())
    });
    
    return isDarkTheme;
}

export function isDark() {
    return isDarkTheme;
}

export function getValue() {
    if (!editorView) return '';
    return editorView.state.doc.toString();
}

// Actualizar el contenido del editor (viene del servidor)
export function setValue(content) {
    if (!editorView) return;
    
    // isReceivingUpdate evita que el onChange se dispare, si no habría bucle infinito: servidor -> setValue -> onChange -> servidor -> ...
    isReceivingUpdate = true;
    
    editorView.dispatch({
        changes: {
            from: 0,
            to: editorView.state.doc.length,
            insert: content
        }
    });
    
    // Desactivar isReceivingUpdate después de un pequeño delay
    setTimeout(() => {
        isReceivingUpdate = false;
    }, 10);
}

export function enableEditor() {
    if (!editorView) return;
    
    editorView.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(true))
    });
}

export function disableEditor() {
    if (!editorView) return;
    
    editorView.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(false))
    });
}

export function getEditor() {
    return editorView;
}