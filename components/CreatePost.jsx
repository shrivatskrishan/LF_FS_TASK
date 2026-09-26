import React, { useState } from 'react';
import ErrorState, { getErrorMessage } from './ErrorState.jsx';

const CreatePost = ({ onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const draft = { title: title.trim(), content: content.trim() };
        if (!draft.title || !draft.content) return;

        setTitle('');
        setContent('');
        setError('');

        try {
            await onPostCreated(draft);
        } catch (err) {
            setTitle(draft.title);
            setContent(draft.content);
            setError(getErrorMessage(err, 'Could not create this post'));
        }
    };

    return (
        <form className="create-post" onSubmit={handleSubmit}>
            {error && <ErrorState title="Post was not created" message={error} />}
            <h2>Create Post</h2>
            <input
                type="text"
                placeholder="Give your post a title..."
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
            />
            <textarea
                placeholder="What's on your mind?"
                value={content}
                rows={3}
                onChange={(event) => setContent(event.target.value)}
                required
            />
            <button type="submit" className="btn-primary">
                <span aria-hidden="true">+</span>
                Post
            </button>
        </form>
    );
};

export default CreatePost;
