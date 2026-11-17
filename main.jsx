import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './frontend_react.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuthProvider } from './hooks/useAuth.js'
import { NotificationProvider } from './hooks/useNotifications.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <AuthProvider>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </AuthProvider>
    </ErrorBoundary>
)
