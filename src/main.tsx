import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme/theme-provider'
import { ToastProvider } from './components/ui/toast'
import { ProductionInfoProvider } from './contexts/ProductionInfoContext'
import { WebProjectProvider } from './contexts/WebProjectContext'
import { AuthProvider } from './auth/AuthProvider'
import AppContent from './AppContent'
import './app/index.css'

// Dev: inject provided access token so API requests authenticate
try {
  localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGUwMzZlZDVlYWRlMzRmMDA1MzUzYjAiLCJlbWFpbCI6ImRuOTI5OUBzcm1pc3QuZWR1LmluIiwidXNlcm5hbWUiOiJEaW5lc2h3YXIiLCJpYXQiOjE3NTk2Njg0NTEsImV4cCI6MTc2MjI2MDQ1MX0.cGc6JfgZIOLdVnF0WobsHDBZH_7yfjsfsBxPEYaaLCg');
} catch (e) {
  console.error('Failed to set dev auth_token', e);
}

const App = () => {
  return (
    <WebProjectProvider>
      <ThemeProvider>
        <ToastProvider>
          <ProductionInfoProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </BrowserRouter>
          </ProductionInfoProvider>
        </ToastProvider>
      </ThemeProvider>
    </WebProjectProvider>
  )
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

const root = createRoot(container)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)