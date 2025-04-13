import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './Context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: '',
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            fontSize: '15px',
          },
          success: {
            duration: 5000,
            style: {
              background: '#064e3b',
            },
            iconTheme: {
              primary: '#34d399',
              secondary: '#ecfdf5',
            },
          },
          error: {
            duration: 6000,
            style: {
              background: '#7f1d1d',
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#fee2e2',
            },
          },
        }}
      />
      <App />
    </AuthProvider>
  </BrowserRouter>
)
