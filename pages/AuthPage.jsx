import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Signup from '../components/Signup.jsx';
import { useAuth } from '../hooks/useAuth.js';

const AuthPage = ({ mode }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleAuthenticated = (user) => {
        setUser(user);
        navigate('/');
    };

    if (mode === 'signup') {
        return (
            <Signup
                onAuthenticated={handleAuthenticated}
                onSwitchToLogin={() => navigate('/login')}
            />
        );
    }

    return (
        <Login
            onAuthenticated={handleAuthenticated}
            onSwitchToSignup={() => navigate('/signup')}
        />
    );
};

export default AuthPage;
