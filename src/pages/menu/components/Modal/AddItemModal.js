import React, { useState } from "react";

const AddItemModal = ({ show, onClose, onSave }) => {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");

  if (!show) return null;

  const isValid = itemName && price;

  const handleSave = () => {

    if (!isValid) return;
    console.log(isValid,">>>>")

    // onSave({
    //   name: itemName,
    //   price: Number(price),
    // });

    // setItemName("");
    // setPrice("");
    // onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        
        {/* 🔝 Header */}
        <div style={headerStyle}>
          <h4 style={{ margin: 0 }}>Add New Item</h4>
          <span style={closeIcon} onClick={onClose}>✕</span>
        </div>

        {/* 📝 Form */}
        <div style={{ marginTop: "15px" }}>
          
          {/* Item Name */}
          <div style={inputGroup}>
            <label style={labelStyle}>Item Name</label>
            <input
              type="text"
              placeholder="e.g. Paneer Butter Masala"
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

//
// 💄 Styles (UI Improved)
//

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