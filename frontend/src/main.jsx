import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

const buildTag = import.meta.env.VITE_COMMIT_SHA || 'local-dev' // FIX
console.debug('[App] booting frontend, build tag:', buildTag) // FIX

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
