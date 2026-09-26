import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';

const appStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #eef1f6;
        color: #111827;
    }
    button, input, textarea { font-family: inherit; }
    .app { min-height: 100vh; }
    .header {
        background: #fff;
        position: sticky;
        top: 0;
        z-index: 20;
        border-bottom: 1px solid #eef0f3;
    }
    .header-inner, .main { max-width: 760px; margin: 0 auto; }
    .header-inner {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0.85rem 1rem;
        gap: 1rem;
    }
    .brand { color: #6d4aff; font-size: 1.35rem; font-weight: 800; letter-spacing: -0.03em; }
    nav { display: flex; align-items: center; gap: 0.15rem; }
    nav a {
        color: #4b5563;
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.92rem;
        font-weight: 600;
    }
    nav a svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
    nav a.active { background: #f3eeff; color: #6d4aff; }
    nav a.active svg { fill: #6d4aff; stroke: #6d4aff; }
    .logout-btn {
        justify-self: end;
        background: none;
        border: none;
        color: #6b7280;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;
    }
    .main { padding: 1.25rem 1rem 3rem; }
    .feed-row { padding-bottom: 1rem; }
    .create-post, .post, .auth-form, .search, .trending, .profile-card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    }
    .create-post { padding: 1.15rem 1.2rem 1rem; margin-bottom: 1rem; display: flex; flex-direction: column; }
    .create-post h2 { font-size: 1.02rem; margin-bottom: 0.85rem; }
    .create-post input, .create-post textarea, .auth-form input, .search input, .add-comment input {
        width: 100%;
        border: none;
        background: #f3f4f6;
        border-radius: 12px;
        padding: 0.8rem 0.9rem;
        margin-bottom: 0.65rem;
        color: #111827;
        font-size: 0.95rem;
        outline: none;
    }
    .create-post textarea { resize: vertical; min-height: 84px; }
    .create-post .btn-primary { align-self: flex-end; margin-top: 0.2rem; }
    .btn-primary {
        background: #6d4aff;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 0.55rem 1rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }
    .btn-primary:disabled { opacity: 0.7; cursor: default; }
    .post { padding: 1.05rem 1.15rem 1rem; }
    .post-header { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { border-radius: 50%; object-fit: cover; display: block; }
    .avatar-fallback {
        border-radius: 50%;
        background: #6d4aff;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        font-weight: 700;
        flex-shrink: 0;
    }
    .post-date { color: #9ca3af; font-size: 0.92rem; }
    .post-identity { display: flex; flex-direction: column; gap: 0.1rem; }
    .post-identity strong { font-size: 0.95rem; }
    .post h3 { margin: 0.85rem 0 0.35rem; font-size: 1.05rem; line-height: 1.35; }
    .post-content { color: #1f2937; line-height: 1.5; font-size: 0.96rem; }
    .post-image { width: 100%; display: block; border-radius: 14px; margin-top: 0.9rem; object-fit: cover; max-height: 420px; }
    .post-stats { display: flex; align-items: center; gap: 0.85rem; margin-top: 0.85rem; color: #6b7280; }
    .stat-btn, .stat-comment, .comment-likes {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.95rem;
        font-weight: 600;
    }
    .stat-btn { background: none; border: none; color: #6b7280; cursor: pointer; padding: 0.15rem; }
    .stat-btn svg { width: 18px; height: 18px; fill: none; stroke: #9ca3af; stroke-width: 1.8; }
    .stat-btn.liked { color: #ef4444; }
    .stat-btn.liked svg { fill: #ef4444; stroke: #ef4444; }
    .comment-likes svg { width: 18px; height: 18px; fill: #ef4444; stroke: #ef4444; }
    .stat-comment {
        background: #f3f4f6;
        color: #6b7280;
        border-radius: 8px;
        padding: 0.18rem 0.45rem;
        font-size: 0.88rem;
    }
    .stat-comment svg { width: 15px; height: 15px; fill: none; stroke: #9ca3af; stroke-width: 1.8; }
    .post-delete { margin-left: auto; background: none; border: none; color: #9ca3af; cursor: pointer; font-weight: 600; }
    .comments-section { margin-top: 0.85rem; }
    .comment {
        display: flex;
        gap: 0.65rem;
        background: #f3f4f6;
        border-radius: 14px;
        padding: 0.7rem 0.8rem;
        margin-bottom: 0.5rem;
    }
    .comment-body p { color: #1f2937; line-height: 1.4; }
    .comment-likes, .comment-like-btn { margin-top: 0.3rem; color: #6b7280; font-size: 0.82rem; font-weight: 600; }
    .comment-like-btn {
        background: none;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        cursor: pointer;
        padding: 0;
    }
    .comment-like-btn svg { width: 14px; height: 14px; fill: none; stroke: #9ca3af; stroke-width: 1.8; }
    .comment-like-btn.liked { color: #ef4444; }
    .comment-like-btn.liked svg { fill: #ef4444; stroke: #ef4444; }
    .comment-likes svg { width: 14px; height: 14px; }
    .add-comment { display: flex; align-items: center; gap: 0.65rem; margin-top: 0.35rem; }
    .add-comment input { margin: 0; width: auto; flex: 1; min-width: 0; border-radius: 999px; background: #fff; border: 1px solid #e5e7eb; }
    .auth-form, .search, .trending, .profile-card { padding: 1.15rem; }
    .auth-form { max-width: 420px; margin: 4rem auto; }
    .auth-form h2, .trending h2, .profile-card h2 { margin-bottom: 0.85rem; }
    .auth-form button[type="submit"], .search form button {
        background: #6d4aff;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 0.6rem 1rem;
        font-weight: 700;
        cursor: pointer;
    }
    .auth-switch { display: block; margin-top: 0.85rem; background: none; border: none; color: #6d4aff; cursor: pointer; font-weight: 600; }
    .auth-error { color: #b91c1c; margin-bottom: 0.5rem; }
    .auth-status, .empty-state { padding: 1rem; color: #6b7280; }
    .error-state { margin: 0.75rem 0; padding: 1rem; border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; border-radius: 12px; }
    .error-state h3 { margin-bottom: 0.35rem; }
    .error-state button { margin-top: 0.75rem; padding: 0.45rem 0.8rem; cursor: pointer; border-radius: 8px; border: none; }
    .trending h2 { font-size: 1.15rem; }
    .trending-item, .search-result { padding: 0.85rem 0; border-bottom: 1px solid #eef0f3; }
    .trending-item:last-child, .search-result:last-child { border-bottom: none; }
    .search { margin-bottom: 1rem; }
    .search form { display: flex; gap: 0.6rem; align-items: center; }
    .search input { margin: 0; width: auto; flex: 1; min-width: 0; }
    .profile-card { text-align: center; }
    .profile-avatar { display: flex; justify-content: center; margin-bottom: 0.75rem; }
    .trending { margin-bottom: 1rem; }
    .profile-card .stats { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; color: #4b5563; font-weight: 600; }
    .profile-card p { color: #4b5563; line-height: 1.5; }
`;

const App = () => {
    return (
        <BrowserRouter>
            <div className="app">
                <AppRoutes />
                <style>{appStyles}</style>
            </div>
        </BrowserRouter>
    );
};

export default App;
