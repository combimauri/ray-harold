import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// The admin panel is a separate chunk so guests never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const isAdmin = /^\/admin\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
