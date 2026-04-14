import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentRestaurant } from "../../features/auth/authSlice";
// import "./SelectRestaurantModal.css";

const SelectRestaurantModal = ({ show, onClose, onSelectDone }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  if (!show) return null;

  const handleSelect = (restaurant) => {
     const storedUser = JSON.parse(localStorage.getItem("user"));
    dispatch(setCurrentRestaurant(restaurant));
    onSelectDone();
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('custom-backdrop')) {
      onClose();
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="custom-backdrop" onClick={handleBackdropClick}></div>

      {/* MODAL */}
      <div className="custom-modal">
        <div className="custom-modal-content">
          {/* HEADER */}
          <div className="custom-header">
            <div className="header-icon">
              <i className="bi bi-shop"></i>
            </div>
            <h4>Select Your Venue</h4>
            <p className="header-subtitle">Choose a restaurant to continue</p>
            <button className="modal-close" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* BODY */}
          <div className="custom-body">
            <div className="restaurant-list">
              {user?.accessibleRestaurants?.map((res, index) => (
                <button
                  key={res.id}
                  className="restaurant-btn"
                  onClick={() => handleSelect(res)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="restaurant-icon">
                    <i className="bi bi-building"></i>
                  </div>
                  <div className="restaurant-info">
                    <span className="restaurant-name">{res.name}</span>
                    <span className="restaurant-address">Main Branch</span>
                  </div>
                  <i className="bi bi-arrow-right-circle restaurant-arrow"></i>
                </button>
              ))}
            </div>

            {user?.accessibleRestaurants?.length === 0 && (
              <div className="empty-state">
                <i className="bi bi-building-slash"></i>
                <p>No restaurants available</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="custom-footer">
            <button className="footer-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectRestaurantModal;