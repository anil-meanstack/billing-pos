import { useState, useEffect } from "react";
import { setCustomerInfo } from "../../../features/cart/cartSlice";
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
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setForm({
      name: customerInfo?.name || "",
      phone: customerInfo?.phone || "",
      address: customerInfo?.address || "",
    });
  }, [customerInfo]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;

      if (value.length > 10) return;
    }

    setForm({
      ...form,
      [name]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    validateField(name, value);
  };
  const validateField = (name, value) => {
    let error = "";

    if (name === "phone") {
      if (!value) error = "Phone number is required";
      else if (!/^\d{10}$/.test(value)) {
        error = "Phone must be exactly 10 digits";
      }
    }

    if (name === "name") {
      if (!value.trim()) error = "Customer name is required";
    }

    if (name === "address" && orderType === "delivery") {
      if (!value.trim()) error = "Address is required for delivery";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === "";
  };

  const handleSave = () => {
    let isValid = true;

    Object.keys(form).forEach((key) => {
      const valid = validateField(key, form[key]);
      if (!valid) isValid = false;
    });

    setTouched({
      phone: true,
      name: true,
      address: true,
    });

    if (!isValid) return;

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
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              name="phone"
              id="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              autoComplete="tel"
            />
            {touched.phone && errors.phone && (
              <span className="error text-danger">{errors.phone}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="name">Customer Name</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter customer name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />
            {touched.name && errors.name && <span className="error text-danger">{errors.name}</span>}
          </div>

          {orderType === "delivery" && (
            <div className="input-group">
              <label htmlFor="address">Address</label>
              <textarea
                name="address"
                id="address"
                placeholder="Enter address"
                value={form.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="3"
                autoComplete="street-address"
              />
              {touched.address && errors.address && (
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