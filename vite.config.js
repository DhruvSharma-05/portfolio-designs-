import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // There is a stray node_modules with an older React in a parent
    // directory (C:\Users\ADMIN). Node/Vite walks up the tree, so without
    // this a dependency (e.g. react-router) could resolve a *second* copy
    // of React and trigger "Invalid hook call / more than one copy of React".
    // Pinning these to the project's own copy guarantees a single instance.
    dedupe: ['react', 'react-dom'],
    alias: {
      react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
    },
  },
})
