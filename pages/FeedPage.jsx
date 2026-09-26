import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import CreatePost from '../components/CreatePost.jsx';
import PostCard from '../components/PostCard.jsx';
import ErrorState, { getErrorMessage } from '../components/ErrorState.jsx';

const FeedPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [scrollMargin, setScrollMargin] = useState(0);
    const listRef = useRef(null);
    const likeLocks = useRef(new Set());

    const fetchFeed = async (silent = false) => {
        if (!silent) setLoading(true);
        setError('');
        try {
            const feed = await api.get('/posts');
            setPosts(feed?.posts || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load the feed'));
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleCreatePost = async ({ title, content }) => {
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            pending: true,
            user_id: user.id,
            title,
            content,
            image_url: null,
            likes_count: 0,
            comment_count: 0,
            comments: [],
            liked_by_me: false,
            createdAt: new Date().toISOString(),
            author: {
                id: user.id,
                username: user.username,
                profile_picture_url: user.profile_picture_url
            }
        };

        setPosts((current) => [optimistic, ...current]);
        setActionError('');

        try {
            const created = await api.post('/posts', { title, content });
            setPosts((current) => current.map((post) => (
                post.id === tempId
                    ? {
                        ...optimistic,
                        ...created,
                        pending: false,
                        comments: [],
                        comment_count: 0,
                        liked_by_me: false,
                        author: optimistic.author
                    }
                    : post
            )));
        } catch (err) {
            setPosts((current) => current.filter((post) => post.id !== tempId));
            throw err;
        }
    };

    const handleLike = async (postId) => {
        if (likeLocks.current.has(postId)) return;

        const currentPost = posts.find((post) => post.id === postId);
        if (!currentPost || currentPost.pending) return;

        const wasLiked = !!currentPost.liked_by_me;
        const previousCount = currentPost.likes_count || 0;
        likeLocks.current.add(postId);
        setActionError('');
        setPosts((current) => current.map((post) => (
            post.id === postId
                ? {
                    ...post,
                    liked_by_me: !wasLiked,
                    likes_count: Math.max(0, previousCount + (wasLiked ? -1 : 1))
                }
                : post
        )));

        try {
            if (wasLiked) {
                await api.delete(`/posts/${postId}/unlike`);
            } else {
                await api.post(`/posts/${postId}/like`, {});
            }
        } catch (err) {
            const status = err.response?.status;
            const alreadyApplied = (!wasLiked && status === 409) || (wasLiked && status === 404);
            if (!alreadyApplied) {
                setPosts((current) => current.map((post) => (
                    post.id === postId
                        ? { ...post, liked_by_me: wasLiked, likes_count: previousCount }
                        : post
                )));
                setActionError(getErrorMessage(err, 'Could not update this like'));
            }
        } finally {
            likeLocks.current.delete(postId);
        }
    };

    const handleDelete = async (postId) => {
        const currentPost = posts.find((post) => post.id === postId);
        if (!currentPost) return;

        const index = posts.findIndex((post) => post.id === postId);
        setActionError('');
        setPosts((current) => current.filter((post) => post.id !== postId));

        if (currentPost.pending) return;

        try {
            await api.delete(`/posts/${postId}`);
        } catch (err) {
            setPosts((current) => {
                if (current.some((post) => post.id === postId)) return current;
                const next = [...current];
                next.splice(index, 0, currentPost);
                return next;
            });
            setActionError(getErrorMessage(err, 'Could not delete this post'));
        }
    };

    useLayoutEffect(() => {
        setScrollMargin(listRef.current?.offsetTop ?? 0);
    }, [posts.length, loading, actionError]);

    const virtualizer = useWindowVirtualizer({
        count: posts.length,
        estimateSize: () => 640,
        overscan: 4,
        scrollMargin,
        getItemKey: (index) => posts[index]?.id ?? index
    });

    return (
        <>
            <CreatePost onPostCreated={handleCreatePost} />
            {loading && <div>Loading feed...</div>}
            {!loading && error && <ErrorState title="Feed unavailable" message={error} onRetry={() => fetchFeed()} />}
            {!loading && !error && (
                <div className="feed">
                    {actionError && <ErrorState title="Action failed" message={actionError} />}
                    {posts.length === 0 && <p className="empty-state">No posts yet.</p>}
                    {posts.length > 0 && (
                        <div ref={listRef}>
                            <div
                                style={{
                                    height: virtualizer.getTotalSize(),
                                    width: '100%',
                                    position: 'relative'
                                }}
                            >
                                {virtualizer.getVirtualItems().map((virtualRow) => {
                                    const post = posts[virtualRow.index];
                                    return (
                                        <div
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={virtualizer.measureElement}
                                            className="feed-row"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`
                                            }}
                                        >
                                            <PostCard
                                                post={post}
                                                onLike={handleLike}
                                                onDelete={handleDelete}
                                                userId={user.id}
                                                currentUser={user}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default FeedPage;
