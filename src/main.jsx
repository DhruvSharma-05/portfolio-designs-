import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted fonts (replaces a render-blocking fonts.googleapis.com
// @import) — only the weights actually used in src/data.js's CSS.
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
// The headline face — every large statement headline is set in it, with
// one word per headline taken to the italic (see .serif in src/data.js).
// Light only, roman and italic: nothing on this site sets Fraunces at
// another weight, and body copy and UI never touch it at all.
import '@fontsource/fraunces/300.css'
import '@fontsource/fraunces/300-italic.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
