import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import PostCard from '../components/PostCard.jsx';
import ErrorState, { getErrorMessage } from '../components/ErrorState.jsx';

const SearchPage = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const likeLocks = useRef(new Set());

    const handleSearch = async (event) => {
        event.preventDefault();
        if (!query.trim()) return;

        setError('');
        setActionError('');
        try {
            const rows = await api.get('/search', { params: { q: query } });
            setResults(rows || []);
            setSearched(true);
        } catch (err) {
            setSearched(false);
            setError(getErrorMessage(err, 'Search failed'));
        }
    };

    const handleLike = async (postId) => {
        if (likeLocks.current.has(postId)) return;

        const currentPost = results.find((post) => post.id === postId);
        if (!currentPost) return;

        const wasLiked = !!currentPost.liked_by_me;
        const previousCount = currentPost.likes_count || 0;
        likeLocks.current.add(postId);
        setActionError('');
        setResults((current) => current.map((post) => (
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
                setResults((current) => current.map((post) => (
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
        const currentPost = results.find((post) => post.id === postId);
        if (!currentPost) return;

        const index = results.findIndex((post) => post.id === postId);
        setActionError('');
        setResults((current) => current.filter((post) => post.id !== postId));

        try {
            await api.delete(`/posts/${postId}`);
        } catch (err) {
            setResults((current) => {
                if (current.some((post) => post.id === postId)) return current;
                const next = [...current];
                next.splice(index, 0, currentPost);
                return next;
            });
            setActionError(getErrorMessage(err, 'Could not delete this post'));
        }
    };

    return (
        <>
            <div className="search">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
                {error && <ErrorState title="Search failed" message={error} />}
            </div>

            {searched && (
                <div className="feed">
                    {actionError && <ErrorState title="Action failed" message={actionError} />}
                    {results.length === 0 ? (
                        <p className="empty-state">No results found</p>
                    ) : (
                        results.map((post) => (
                            <div key={post.id} className="feed-row">
                                <PostCard
                                    post={post}
                                    onLike={handleLike}
                                    onDelete={handleDelete}
                                    userId={user.id}
                                    currentUser={user}
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </>
    );
};

export default SearchPage;
