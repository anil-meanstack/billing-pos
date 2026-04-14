import React from 'react';

const OrderStatus = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    processing: {
      className: 'processingMessage',
      content: (
        <>
          <div className="processingSpinner"></div>
          Processing your order...
        </>
      ),
    },
    success: {
      className: 'successMessage',
      content: '✅ Order placed successfully!',
    },
    error: {
      className: 'errorMessage',
      content: '⚠️ Order saved locally. Will sync when connection is restored.',
    },
  };

  const config = statusConfig[status];

  return config ? (
    <div className={config.className}>{config.content}</div>
  ) : null;
};

export default OrderStatus;