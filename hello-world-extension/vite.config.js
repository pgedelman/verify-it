// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: 'index.html',  // Vite uses index.html as the entry point for the popup
        background: 'src/background.js',  // Ensure background.js is included
        content: 'src/content.js',  // Optional: include content.js if it's used as a content script
      },
      output: {
        entryFileNames: '[name].js', // Keep original file names for entry points
      }
    },
    assetsDir: '',  // Avoid placing assets in an extra folder, this keeps everything in dist/
  },
});
