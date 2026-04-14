import { useState } from "react";
import Toast from "./Toast";
import "./Alert.css";

let id = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const newToast = { id: id++, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 2800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer = () => (
    <div className="twrap">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onRemove={() => removeToast(t.id)}
        />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
};