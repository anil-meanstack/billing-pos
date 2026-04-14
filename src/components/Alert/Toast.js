import { useEffect } from "react";
import "./Alert.css";

const Toast = ({ message, type = "info", onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;