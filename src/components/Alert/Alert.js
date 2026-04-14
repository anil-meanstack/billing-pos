import { useEffect } from "react";
import "./Alert.css";

const Alert = ({ message, type = "danger", show, onClose, duration = 1000 }) => {

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`custom-alert alert alert-${type} alert-dismissible fade show`}>
      {message}

      <button
        type="button"
        className="btn-close"
        onClick={onClose}
      ></button>
    </div>
  );
};

export default Alert;
