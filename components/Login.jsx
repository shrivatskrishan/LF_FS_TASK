import React, { useState } from 'react';
import api from '../services/api.js';

const Login = ({ onAuthenticated, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const session = await api.post('/login', { email, password });
            localStorage.setItem('token', session.token);
            onAuthenticated(session.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleLogin}>
            <h2>Log in</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Log in'}
            </button>
            <button type="button" className="auth-switch" onClick={onSwitchToSignup}>
                Need an account? Register
            </button>
        </form>
    );
};

export default Login;
