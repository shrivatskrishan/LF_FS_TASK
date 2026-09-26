import React, { useState } from 'react';

const COLORS = ['#6d4aff', '#7c3aed', '#4f46e5', '#0284c7', '#db2777', '#059669'];

function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function colorFor(name) {
    const value = String(name || '');
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash + value.charCodeAt(index)) % COLORS.length;
    }
    return COLORS[hash];
}

const Avatar = ({ src, name, size = 36 }) => {
    const [failed, setFailed] = useState(false);
    const label = initials(name);

    if (!src || failed) {
        return (
            <span
                className="avatar-fallback"
                style={{ width: size, height: size, background: colorFor(name), fontSize: size > 64 ? '1.6rem' : undefined }}
                aria-hidden="true"
            >
                {label}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt=""
            className="avatar"
            style={{ width: size, height: size }}
            onError={() => setFailed(true)}
        />
    );
};

export default Avatar;
