import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend_react.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './hooks/useAuth.js'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <AuthProvider>
            <App />
        </AuthProvider>
    </ErrorBoundary>
)
