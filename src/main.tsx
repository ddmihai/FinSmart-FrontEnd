import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './state/AuthContext'
// Register PWA service worker (no top-level await for wider targets)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try { registerSW({ immediate: true }) } catch { /* no-op */ }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
