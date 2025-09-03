import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'

// Configurar o logger para desenvolvimento
import { logger } from './lib/logger'

// Log de inicialização da aplicação
logger.info('🚀 Inicializando PingFront - Sistema de Gestão Escolar')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
