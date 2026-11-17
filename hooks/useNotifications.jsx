import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth.js';

const NotificationContext = createContext(null);

function noticeText(message, userId) {
    const title = message.title ? `“${message.title}”` : 'a post';
    if (message.type === 'post_deleted') {
        return `${message.actorName} deleted ${title}`;
    }
    if (message.type === 'post_liked') {
        if (Number(message.authorId) === Number(userId)) {
            return `${message.actorName} liked your post ${title}`;
        }
        return `${message.actorName} liked ${title}`;
    }
    return '';
}

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const listeners = useRef(new Set());

    const subscribe = useCallback((listener) => {
        listeners.current.add(listener);
        return () => listeners.current.delete(listener);
    }, []);

    const dismiss = useCallback((id) => {
        setNotices((current) => current.filter((notice) => notice.id !== id));
    }, []);

    useEffect(() => {
        if (!user) return undefined;

        const token = localStorage.getItem('token');
        if (!token) return undefined;

        let socket;
        let retryTimer;
        let closed = false;

        const connect = () => {
            socket = new WebSocket(`ws://localhost:3000/ws?token=${encodeURIComponent(token)}`);

            socket.onmessage = (event) => {
                let message;
                try {
                    message = JSON.parse(event.data);
                } catch (err) {
                    return;
                }

                console.log('[notification] received', message);
                listeners.current.forEach((listener) => listener(message));

                if (Number(message.actorId) === Number(user.id)) return;
                const text = noticeText(message, user.id);
                if (!text) return;

                const id = `${Date.now()}-${message.type}-${message.postId}`;
                setNotices((current) => [...current, { id, text }].slice(-4));
                setTimeout(() => dismiss(id), 5000);
            };

            socket.onclose = (event) => {
                if (closed || event.code === 4001) return;
                retryTimer = setTimeout(connect, 2000);
            };
        };

        connect();

        return () => {
            closed = true;
            clearTimeout(retryTimer);
            if (socket) socket.close();
        };
    }, [user, dismiss]);

    return (
        <NotificationContext.Provider value={{ subscribe }}>
            {children}
            <div className="notice-stack" aria-live="polite">
                {notices.map((notice) => (
                    <button key={notice.id} type="button" className="notice" onClick={() => dismiss(notice.id)}>
                        {notice.text}
                    </button>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useLivePosts(setPosts) {
    const context = useContext(NotificationContext);
    const { user } = useAuth();

    useEffect(() => {
        if (!context) return undefined;
        return context.subscribe((message) => {
            if (message.type === 'post_deleted') {
                setPosts((current) => current.filter((post) => post.id !== message.postId));
                return;
            }
            if (message.type !== 'post_liked' && message.type !== 'post_unliked') return;
            setPosts((current) => current.map((post) => {
                if (post.id !== message.postId) return post;
                const isActor = Number(message.actorId) === Number(user?.id);
                return {
                    ...post,
                    likes_count: message.likesCount,
                    liked_by_me: isActor ? message.liked : post.liked_by_me
                };
            }));
        });
    }, [context, setPosts, user?.id]);
}
