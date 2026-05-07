import { useEffect } from "react";
import "./Alert.css";

const Alert = ({ message, type = "danger", show, onClose, duration = 2000 }) => {

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose,duration]);

  if (!show) return null;

  return (
    <div className={`custom-alert alert alert-${type} alert-dismissible fade show`}>
      {message}
    </div>
  );
};

export default Alert;
