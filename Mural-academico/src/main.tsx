import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthCallbackPage } from './pages/AuthCallbackPage.tsx'

const isCallback = window.location.pathname === '/auth/callback'


createRoot(document.getElementById('root')!).render(
  <StrictMode>{isCallback ? <AuthCallbackPage /> : <App />}</StrictMode>,
)