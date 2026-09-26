import React from 'react';

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    return error?.response?.data?.message || error?.message || fallback;
}

const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => {
    return (
        <div className="error-state" role="alert">
            <h3>{title}</h3>
            <p>{message || 'Please try again.'}</p>
            {onRetry && (
                <button type="button" onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
