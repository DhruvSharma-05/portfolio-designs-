import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Local dev split: Vite serves the SPA (this server), and the
    // Vercel serverless functions in api/ run under `vercel dev` on
    // :3001 (npm run dev:api). We proxy /api/* across to them.
    //
    // Why not just `vercel dev` for everything: its SPA rewrite forwards
    // every route to /index.html, and Vite's dev server then tries to
    // import-analyse the HTML as a JS module and errors. Serving the
    // frontend straight from Vite (with its own SPA fallback) avoids that.
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
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
