import React from 'react';
import ErrorState from './ErrorState.jsx';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error(error);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="app">
                    <ErrorState
                        title="This screen crashed"
                        message={this.state.error.message}
                        onRetry={() => window.location.reload()}
                    />
                    <style>{`
                        .app { max-width: 800px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                        .error-state { margin: 1rem; padding: 1rem; border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; border-radius: 8px; }
                        .error-state h3 { margin-bottom: 0.35rem; }
                        .error-state button { margin-top: 0.75rem; padding: 0.45rem 0.8rem; cursor: pointer; }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
