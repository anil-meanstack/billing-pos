import { useState, useEffect } from "react";
import { setCustomerInfo } from "../../features/cart/cartSlice";
import "./CustomerModal.css";

const CustomerModal = ({
  orderType,
  customerInfo,
  dispatch,
  onClose,
  onPlaceOrder,
}) => {
  const [form, setForm] = useState({
    name: customerInfo?.name || "",
    phone: customerInfo?.phone || "",
    address: customerInfo?.address || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      name: customerInfo?.name || "",
      phone: customerInfo?.phone || "",
      address: customerInfo?.address || "",
    });
  }, [customerInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!form.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (orderType === "delivery" && !form.address.trim()) {
      newErrors.address = "Address is required for delivery";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    dispatch(setCustomerInfo(form));
    onClose();
  };

  return (
    <div className="customer-modal-overlay">
      <div className="customer-modal">
        <div className="customer-modal-header">
          <h3>Customer Details</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="customer-modal-body">

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.phone && <span className="error text-danger">{errors.phone}</span>}
          </div>

          <div className="input-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error text-danger">{errors.name}</span>}
          </div>

          {orderType === "delivery" && (
            <div className="input-group">
              <label>Address</label>
              <textarea
                name="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                rows="3"
              />
              {errors.address && (
                <span className="error text-danger">{errors.address}</span>
              )}
            </div>
          )}
        </div>

        <div className="customer-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="save-btn" onClick={handleSave}>
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;