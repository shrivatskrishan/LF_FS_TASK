import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const HomeIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
    </svg>
);

const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4" />
    </svg>
);

const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <h1 className="brand">SocialApp</h1>
                    <nav>
                        <NavLink to="/" end>
                            <HomeIcon /> Feed
                        </NavLink>
                        <NavLink to="/trending">🔥 Trending</NavLink>
                        <NavLink to="/search">
                            <SearchIcon /> Search
                        </NavLink>
                        <NavLink to="/profile">
                            <ProfileIcon /> Profile
                        </NavLink>
                    </nav>
                    <button type="button" className="logout-btn" onClick={handleLogout} title={user?.username || 'Log out'}>
                        Log out
                    </button>
                </div>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </>
    );
};

export default AppLayout;
