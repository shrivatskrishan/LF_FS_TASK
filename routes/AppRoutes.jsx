import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ErrorState from '../components/ErrorState.jsx';
import AppLayout from '../components/AppLayout.jsx';

const AuthPage = lazy(() => import('../pages/AuthPage.jsx'));
const FeedPage = lazy(() => import('../pages/FeedPage.jsx'));
const TrendingPage = lazy(() => import('../pages/TrendingPage.jsx'));
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx'));

const PageFallback = () => <p className="auth-status">Loading page...</p>;

const SessionGate = ({ children }) => {
    const { authChecked, authError, retrySession } = useAuth();

    if (!authChecked) {
        return <p className="auth-status">Checking session...</p>;
    }

    if (authError) {
        return <ErrorState title="Could not start the app" message={authError} onRetry={retrySession} />;
    }

    return children;
};

const RequireAuth = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <AppLayout />;
};

const GuestOnly = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to="/" replace />;
    return children;
};

const AppRoutes = () => {
    return (
        <SessionGate>
            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
                    <Route path="/signup" element={<GuestOnly><AuthPage mode="signup" /></GuestOnly>} />
                    <Route element={<RequireAuth />}>
                        <Route path="/" element={<FeedPage />} />
                        <Route path="/trending" element={<TrendingPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </SessionGate>
    );
};

export default AppRoutes;
