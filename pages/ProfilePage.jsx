import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';
import Avatar from '../components/Avatar.jsx';
import ErrorState, { getErrorMessage } from '../components/ErrorState.jsx';

const ProfilePage = () => {
    const { user: sessionUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUserProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const profile = await api.get(`/users/${sessionUser.id}`);
            setUser(profile);
        } catch (err) {
            setUser(null);
            setError(getErrorMessage(err, 'Could not load this profile'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [sessionUser.id]);

    if (loading) return <div>Loading...</div>;
    if (error) {
        return <ErrorState title="Profile unavailable" message={error} onRetry={fetchUserProfile} />;
    }
    if (!user) return <div>User not found</div>;

    return (
        <div className="profile-card">
            <div className="profile-avatar">
                <Avatar src={user.profile_picture_url} name={user.username} size={88} />
            </div>
            <h2>{user.username}</h2>
            <p>{user.bio}</p>
            <div className="stats">
                <div>Posts: {user.total_posts}</div>
                <div>Comments: {user.total_comments}</div>
                <div>Likes: {user.total_post_likes || 0}</div>
            </div>
        </div>
    );
};

export default ProfilePage;
