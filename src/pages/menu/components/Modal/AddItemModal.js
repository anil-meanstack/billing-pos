import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loadCart } from "../../../../features/cart/cartSlice";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const AddItemModal = ({ show, onClose, onSave }) => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [special_instructions, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();


  if (!show) return null;

  const isValid = itemName.trim() !== "" && Number(price) > 0;

  const getAuthData = () => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (err) {
      console.error("Auth Parse Error:", err);
      return null;
    }
  };

  const getRestaurantId = () => {
    const auth = getAuthData();
    return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
  };
  const getToken = () => {
    const auth = getAuthData();
    return auth?.accessToken || null;
  };

  const handleSave = async () => {

    if (!isValid) return;
    const restaurantId = getRestaurantId();
    const token = getToken();
    try {
      const payload = {
        name: itemName.trim(),
        price: Number(price),
        quantity: quantity,
        special_instructions: special_instructions,
      };

      const res = await fetch(
        `${API_BASE_URL}/owner/cart/custom/addd/${restaurantId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add item");
      }

      dispatch(loadCart());

      setItemName("");
      setPrice("");
      setNote("");
      setQuantity(1);

      onClose();
    } catch (err) {
      console.error("Error:", err.message);
      alert("Something went wrong!");
    }
  };
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        <div style={headerStyle}>
          <div>
            <h4 style={{ margin: 0, fontSize: "15px" }}>Add Open Item</h4>
            <h6 style={{ fontSize: "11px" }}>Item not on the menu? Add it manually here.</h6>
          </div>
          <span style={closeIcon} onClick={onClose}>✕</span>
        </div>

        {/* 📝 Form */}
        <div style={{ marginTop: "15px" }}>

          {/* Item Name */}
          <div style={inputGroup}>
            <label style={labelStyle}>Item Name</label>
            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Price */}
          <div style={inputGroup}>
            <label style={labelStyle}>Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={inputGroup}>
            <label style={labelStyle}>Note / Description (optional)</label>
            <input
              type="text"
              placeholder="Special Instructions"
              value={special_instructions}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>

        </div>

        <div style={quantityStyle}>
          <span className="modal-quantity-label">Quantity</span>

          <div className="modal-quantity-controls">
            <button
              className="modal-quantity-btn"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              −
            </button>

            <span className="modal-quantity-value">{quantity}</span>

            <button
              className="modal-quantity-btn"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* 🔘 Buttons */}
        <div style={buttonContainer}>
          <button style={cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button
            style={{
              ...saveBtn,
              opacity: isValid ? 1 : 0.6,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
            disabled={!isValid}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;


const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const quantityStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0px 4px",
  background: "#f5f5f5",
  borderBottom: "1px solid #f0f0f0",
  borderTop: "1px solid #f0f0f0",
  borderRadius: "8px"
}

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  width: "320px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  animation: "fadeIn 0.2s ease-in-out",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #eee",
  paddingBottom: "10px",
};

const closeIcon = {
  cursor: "pointer",
  fontSize: "18px",
  color: "#999",
};

const inputGroup = {
  marginBottom: "15px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
  display: "block",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none",
};

const buttonContainer = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const cancelBtn = {
  flex: 1,
  padding: "8px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "#f5f5f5",
  fontWeight: "500",
};

const saveBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#e05c20",
  color: "#fff",
  fontWeight: "600",
};