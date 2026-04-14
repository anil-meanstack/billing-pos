import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="errorContainer">
      <div className="errorIcon">⚠️</div>
      <p className="errorText">{message}</p>
      {onRetry && (
        <button className="retryButton" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;