import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()))
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error)
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
