import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [authError, setAuthError] = useState('');
    const [sessionAttempt, setSessionAttempt] = useState(0);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(() => {});
    }, [logout]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthChecked(true);
            return;
        }

        let cancelled = false;
        setAuthError('');

        api.get('/me')
            .then((currentUser) => {
                if (!cancelled) setUser(currentUser);
            })
            .catch((error) => {
                if (cancelled) return;
                if (error.response?.status === 401) {
                    logout();
                    return;
                }
                setAuthError(error.response?.data?.message || 'Could not check your session');
            })
            .finally(() => {
                if (!cancelled) setAuthChecked(true);
            });

        return () => {
            cancelled = true;
        };
    }, [logout, sessionAttempt]);

    const retrySession = useCallback(() => {
        setAuthChecked(false);
        setAuthError('');
        setSessionAttempt((attempt) => attempt + 1);
    }, []);

    const value = {
        user,
        setUser,
        authChecked,
        authError,
        retrySession,
        logout,
        isAuthenticated: Boolean(user)
    };

    return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
