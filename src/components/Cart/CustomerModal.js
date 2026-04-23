import { useState, useEffect } from "react";
import { setCustomerInfo } from "../../features/cart/cartSlice";
import "./CustomerModal.css";

const CustomerModal = ({ orderType, customerInfo, dispatch, onClose, onPlaceOrder }) => {
  const [form, setForm] = useState({
    name: customerInfo.name || "",
    phone: customerInfo.phone || "",
    address: customerInfo.address || "",
  });

  useEffect(() => {
    setForm({
      name: customerInfo.name || "",
      phone: customerInfo.phone || "",
      address: customerInfo.address || "",
    });
  }, [customerInfo]);

  const handleChange = (e) => {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(updatedForm);
    dispatch(setCustomerInfo(updatedForm));
  };


  return (
    // <div className="simple-modal-backdrop">
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="simple-modal">
        <div className="modal-header">
          <h6>Customer Details</h6>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">
           <input
            className="form-control mb-2"
            placeholder="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            maxLength="10"
          />
          
          <input
            className="form-control mb-2"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="form-control"
            placeholder="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="modal-footer">
          <button className="btn cancel-btn" onClick={onClose}>
            ✖ Cancel
          </button>

          <button className="btn save-btn" onClick={onClose}>
            ✔ Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;