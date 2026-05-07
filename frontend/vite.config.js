import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
