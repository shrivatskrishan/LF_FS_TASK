import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api.js';
import Avatar from './Avatar.jsx';
import ErrorState, { getErrorMessage } from './ErrorState.jsx';

function formatDate(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const HeartIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
);

const CommentIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 17.5 3.5 20V6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 17H6z" />
    </svg>
);

const PostCard = ({ post, onLike, onDelete, userId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentsError, setCommentsError] = useState('');
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const commentLocks = useRef(new Set());

    const fetchComments = async () => {
        setCommentsError('');
        try {
            const rows = await api.get(`/posts/${post.id}/comments`);
            setComments(rows || []);
            setCommentCount((rows || []).length);
        } catch (err) {
            setCommentsError(getErrorMessage(err, 'Could not load comments'));
        }
    };

    useEffect(() => {
        const embedded = Array.isArray(post.comments) ? post.comments.filter((comment) => comment.content) : [];
        setCommentCount(post.comment_count || embedded.length || 0);
        if (embedded.length || !(post.comment_count > 0)) {
            setComments(embedded);
            return;
        }
        fetchComments();
    }, [post.id]);

    const handleAddComment = async () => {
        const content = newComment.trim();
        if (!content || post.pending) return;

        const tempId = `temp-comment-${Date.now()}`;
        const optimistic = {
            id: tempId,
            content,
            likes_count: 0,
            liked_by_me: false,
            author: {
                id: currentUser?.id,
                username: currentUser?.username,
                profile_picture_url: currentUser?.profile_picture_url
            }
        };

        setCommentsError('');
        setNewComment('');
        setComments((current) => [...current, optimistic]);
        setCommentCount((count) => count + 1);

        try {
            const created = await api.post(`/posts/${post.id}/comments`, { content });
            setComments((current) => current.map((comment) => (
                comment.id === tempId ? { ...optimistic, id: created.id } : comment
            )));
        } catch (err) {
            setComments((current) => current.filter((comment) => comment.id !== tempId));
            setCommentCount((count) => Math.max(0, count - 1));
            setNewComment(content);
            setCommentsError(getErrorMessage(err, 'Could not post this comment'));
        }
    };

    const handleCommentLike = async (commentId) => {
        if (commentLocks.current.has(commentId) || String(commentId).startsWith('temp')) return;

        const currentComment = comments.find((comment) => comment.id === commentId);
        if (!currentComment) return;

        const wasLiked = !!currentComment.liked_by_me;
        const previousCount = currentComment.likes_count || 0;
        commentLocks.current.add(commentId);
        setCommentsError('');
        setComments((current) => current.map((comment) => (
            comment.id === commentId
                ? {
                    ...comment,
                    liked_by_me: !wasLiked,
                    likes_count: Math.max(0, previousCount + (wasLiked ? -1 : 1))
                }
                : comment
        )));

        try {
            if (wasLiked) {
                await api.delete(`/comments/${commentId}/unlike`);
            } else {
                await api.post(`/comments/${commentId}/like`, {});
            }
        } catch (err) {
            const status = err.response?.status;
            const alreadyApplied = (!wasLiked && status === 409) || (wasLiked && status === 404);
            if (!alreadyApplied) {
                setComments((current) => current.map((comment) => (
                    comment.id === commentId
                        ? { ...comment, liked_by_me: wasLiked, likes_count: previousCount }
                        : comment
                )));
                setCommentsError(getErrorMessage(err, 'Could not update this like'));
            }
        } finally {
            commentLocks.current.delete(commentId);
        }
    };

    const authorPhoto = post.author?.profile_picture_url || post.profile_picture_url;
    const createdAt = formatDate(post.createdAt || post.created_at);

    return (
        <article className="post">
            <div className="post-header">
                <Avatar src={authorPhoto} name={post.author?.username || post.username} size={40} />
                {createdAt && <span className="post-date">{createdAt}</span>}
            </div>

            <h3>{post.title}</h3>
            <p className="post-content">{post.content}</p>
            {post.image_url && <img className="post-image" src={post.image_url} alt="" />}

            <div className="post-stats">
                <button
                    type="button"
                    className={`stat-btn${post.liked_by_me ? ' liked' : ''}`}
                    aria-pressed={!!post.liked_by_me}
                    aria-label={post.liked_by_me ? 'Unlike' : 'Like'}
                    onClick={() => onLike(post.id)}
                    disabled={post.pending}
                >
                    <HeartIcon /> {post.likes_count}
                </button>
                <span className="stat-comment">
                    <CommentIcon /> {commentCount}
                </span>
                {userId === post.user_id && (
                    <button type="button" className="post-delete" onClick={() => onDelete(post.id)}>
                        Delete
                    </button>
                )}
            </div>

            <div className="comments-section">
                {commentsError && (
                    <ErrorState title="Comments unavailable" message={commentsError} onRetry={fetchComments} />
                )}
                {comments.map((comment) => (
                    <div key={comment.id} className="comment">
                        <Avatar
                            src={comment.author?.profile_picture_url || comment.profile_picture_url}
                            name={comment.author?.username || comment.username}
                            size={32}
                        />
                        <div className="comment-body">
                            <p>{comment.content}</p>
                            <button
                                type="button"
                                className={`comment-like-btn${comment.liked_by_me ? ' liked' : ''}`}
                                aria-pressed={!!comment.liked_by_me}
                                aria-label={comment.liked_by_me ? 'Unlike comment' : 'Like comment'}
                                onClick={() => handleCommentLike(comment.id)}
                                disabled={String(comment.id).startsWith('temp')}
                            >
                                <HeartIcon /> {comment.likes_count || 0}
                            </button>
                        </div>
                    </div>
                ))}

                <div className="add-comment">
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleAddComment();
                            }
                        }}
                    />
                    <button type="button" className="btn-primary" onClick={handleAddComment}>
                        Post
                    </button>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
