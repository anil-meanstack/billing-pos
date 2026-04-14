import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className='container-fluid'>
      <div className="loadingContainer">
      <div className="spinner"></div>
      <p className="loadingText">{text}</p>
    </div>
    </div>
  );
};

export default LoadingSpinner;