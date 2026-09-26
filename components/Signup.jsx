import React, { useState } from 'react';
import api from '../services/api.js';

const Signup = ({ onAuthenticated, onSwitchToLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/users', { username, email, password });
            const session = await api.post('/login', { email, password });
            localStorage.setItem('token', session.token);
            onAuthenticated(session.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleRegister}>
            <h2>Create account</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
            />
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
                {loading ? 'Please wait...' : 'Register'}
            </button>
            <button type="button" className="auth-switch" onClick={onSwitchToLogin}>
                Already have an account? Log in
            </button>
        </form>
    );
};

export default Signup;
