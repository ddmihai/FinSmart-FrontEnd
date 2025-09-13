import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './state/AuthContext'
// Register PWA service worker (autoUpdate)
try {
  // vite-plugin-pwa virtual module, available at build and dev
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { registerSW } = await import('virtual:pwa-register')
  registerSW({ immediate: true })
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
