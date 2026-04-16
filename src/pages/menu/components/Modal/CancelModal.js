import React from 'react'

const CancelModal = ({show, onClose,onConfirm,message  }) => {
    if (!show) return null;
    return (
            <div className="pos-modal-overlay">
                <div className="pos-modal">
                    <h4>Cancel Order?</h4>
                    <p>{message}</p>
                    <div className="pos-modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            No
                        </button>

                        <button
                            className="btn btn-danger"
                             onClick={onConfirm}
                            style={{
                                backgroundColor: "#e05c20",
                                borderRadius: "10px",
                            }}
                        >
                            Yes, Cancel
                        </button>
                    </div>

                </div>
            </div>
    )
}

export default CancelModal