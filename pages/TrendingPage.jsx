import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Avatar from '../components/Avatar.jsx';
import ErrorState, { getErrorMessage } from '../components/ErrorState.jsx';

function formatDate(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

const TrendingPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTrending = async () => {
        setLoading(true);
        setError('');
        try {
            const rows = await api.get('/trending');
            setPosts(rows || []);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not load trending posts'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrending();
    }, []);

    if (loading) return <div className="empty-state">Loading trending posts...</div>;
    if (error) return <ErrorState title="Trending unavailable" message={error} onRetry={fetchTrending} />;

    return (
        <>
            <div className="trending">
                <h2>Trending Posts (Last 7 Days)</h2>
                {posts.length === 0 && <p className="empty-state">No trending posts right now.</p>}
            </div>
            {posts.length > 0 && (
                <div className="feed">
                    {posts.map((post) => {
                        const authorName = post.author?.username || post.username || 'Unknown';
                        const createdAt = formatDate(post.createdAt || post.created_at);
                        return (
                            <article key={post.id} className="post feed-row">
                                <div className="post-header">
                                    <Avatar
                                        src={post.author?.profile_picture_url || post.profile_picture_url}
                                        name={authorName}
                                        size={40}
                                    />
                                    <div className="post-identity">
                                        <strong>{authorName}</strong>
                                        {createdAt && <span className="post-date">{createdAt}</span>}
                                    </div>
                                </div>
                                <h3>{post.title}</h3>
                                <p className="post-content">{post.content}</p>
                                {post.image_url && <img className="post-image" src={post.image_url} alt="" />}
                                <div className="post-stats">
                                    <span className="stat-comment">❤️ {post.likes_count}</span>
                                    <span className="stat-comment">💬 {post.comment_count}</span>
                                </div>
                                {(post.comments || []).length > 0 && (
                                    <div className="comments-section">
                                        {post.comments.map((comment) => {
                                            const commentAuthor = comment.author?.username || comment.username || 'Unknown';
                                            return (
                                                <div key={comment.id} className="comment">
                                                    <Avatar
                                                        src={comment.author?.profile_picture_url || comment.profile_picture_url}
                                                        name={commentAuthor}
                                                        size={32}
                                                    />
                                                    <div className="comment-body">
                                                        <p>{comment.content}</p>
                                                        <span className="comment-likes">❤️ {comment.likes_count || 0}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default TrendingPage;
