# Frontend - CodeHub

## Configuración de desarrollo

Este frontend usa **Vite** como bundler. Vite es mucho más rápido que Webpack y tiene configuración mínima.

### Comandos

```bash
# Instalardependencias (solo la primera vez o al añadir nuevas)
npm install

# Servidor de desarrollo (con hot reload)
npm run dev

# Build para producción (genera carpeta dist/)
npm run build

# Vista previa del build
npm run preview
```

### Estructura

```
frontend/
├── index.html          # Punto de entrada
├── styles.css          # Estilos globales
├── js/
│   ├── main.js        # Archivo principal que carga todo
│   ├── config.js      # Configuración Socket.IO
│   ├── editor/
│   │   └── editorCodeMirror.js  # Lógica de CodeMirror 6
│   ├── handlers/
│   │   ├── socketHandlers.js    # Eventos Socket.IO
│   │   └── domHandlers.js       # Eventos del DOM
│   └── ui/
│       ├── editorUI.js
│       ├── loginUI.js
│       ├── participantsUI.js
│       └── roomsUI.js
```

## CodeMirror 6

He elegido CodeMirror 6 en vez de Monaco (el de VS Code) porque:
- Monaco es muy pesado (~5MB)
- CodeMirror es más ligero (~300KB)
- API más simple de usar

### Lenguajes soportados

- JavaScript / TypeScript
- Python
- Java
- C / C++
- C# (usa parser de Java, es parecido)
- HTML / CSS
- SQL
- JSON
- Markdown

### Temas

Los usuarios pueden cambiar entre tema claro y oscuro con el botón 🌙/☀️
La preferencia se guarda en localStorage.

## Sincronización con Socket.IO

El editor usa un sistema de "bandera" (`isReceivingUpdate`) para evitar bucles infinitos:

1. Usuario escribe → emite al servidor
2. Servidor reenvía a todos
3. Cuando llega un cambio remoto, activo la bandera
4. `setValue()` actualiza el editor SIN disparar `onChange`
5. Desactivo la bandera después

Si no hiciera esto, habría bucle infinito: cambio → emit → recibo → cambio → emit → ...

## Vite vs Webpack

Elegí Vite porque:
- **Desarrollo**: Vite usa esbuild (escrito en Go) → 100x más rápido
- **HMR instantáneo**: Los cambios aparecen en <50ms
- **Configuración simple**: vite.config.js de 10 líneas vs webpack.config.js de 100+
- **ESM nativo**: Vite sirve módulos ESM directamente en dev, solo bundlea en prod

## Docker

El Dockerfile hace:
1. `npm install` → descarga dependencias
2. `npm run build` → Vite genera carpeta `dist/`
3. `serve -s dist` → sirve los archivos estáticos

En producción NO se usa `npm run dev`, se sirven los archivos ya compilados.

---

## Ejecución de Código

El frontend incluye funcionalidad para ejecutar código directamente desde el editor:

### Componentes de UI

- **Botón "▶️ Ejecutar"**: Ubicado en la barra del editor
- **Panel de salida**: Muestra resultados de ejecución con:
  - Salida estándar (texto verde si exitoso)
  - Errores de compilación/ejecución (texto rojo)
  - Tiempo de ejecución en milisegundos
  - Botón para cerrar el panel

### Flujo de ejecución

1. Usuario presiona "▶️ Ejecutar"
2. Frontend valida que el usuario tenga permisos
3. Envía evento Socket.IO `executeCode` con:
   - `code`: Contenido del editor
   - `language`: Lenguaje seleccionado
   - `roomId`: ID de la sala actual
4. Servidor valida permisos y ejecuta código
5. Servidor emite `executionResult` a todos los participantes de la sala
6. Frontend muestra resultado en el panel de salida

### Estados del botón

- **Normal**: Botón clickable con icono ▶️
- **Ejecutando**: Botón deshabilitado con spinner giratorio
- **Deshabilitado**: Cuando el usuario no tiene permisos

### Visualización de resultados

El panel de salida muestra:
- **Éxito** (fondo verde): Salida estándar del programa
- **Error** (fondo rojo): Errores de compilación o ejecución
- **Tiempo de ejecución**: Siempre visible junto al título

Todos los usuarios de la sala ven el mismo resultado, promoviendo la colaboración y el aprendizaje conjunto.

### Archivos relacionados

- `js/handlers/domHandlers.js`: Listener del botón ejecutar
- `js/handlers/socketHandlers.js`: Listener de `executionResult`
- `js/ui/editorUI.js`: Funciones `displayExecutionResult()`, `setExecuteButtonLoading()`
- `index.html`: Estructura HTML del botón y panel
- `styles.css`: Estilos del panel de salida
