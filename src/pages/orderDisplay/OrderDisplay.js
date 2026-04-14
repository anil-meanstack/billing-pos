import React from "react";
import { useNavigate } from "react-router-dom";

const OrderSuccess = () => {

  const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || [];
  const latestOrder = orders[orders.length - 1];
  const navigate=useNavigate()

  if (!latestOrder) {
    return <h4 className="text-center mt-5">No order found</h4>;
  }

  const order = {
    orderId: latestOrder.orderNumber,
    paymentMethod: "Cash on Delivery",
    total:
      latestOrder.total ??
      latestOrder.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      ),
  };

  const backToHome = () =>{
    navigate("/menu-item")
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow text-center p-4">

            <div className="mb-3">
              <div
                className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center"
                style={{ width: 70, height: 70, fontSize: 36 }}
              >
                ✓
              </div>
            </div>

            <h3 className="fw-bold text-success">
              Order Placed Successfully!
            </h3>

            <p className="text-muted">
              Thank you for your order. Your food is being prepared 🍕
            </p>

            <div className="border rounded p-3 my-4 text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Order ID</span>
                <span className="fw-bold">#{order.orderId}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Payment Method</span>
                <span className="fw-bold">{order.paymentMethod}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Amount</span>
                <span className="fw-bold text-success">
                  ₹{order.total}
                </span>
              </div>
            </div>

            <div className="alert alert-info">
              🚚 Estimated delivery time: <b>30–40 minutes</b>
            </div>

            <div className="d-grid gap-2 mt-3">
              <button className="btn btn-primary">Track Order</button>
              <button className="btn btn-outline-secondary" onClick={backToHome}>
                Back to Home
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
