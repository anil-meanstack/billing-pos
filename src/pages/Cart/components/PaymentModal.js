import React from "react";

const PaymentModal = ({
  show,
  onClose,
  subtotal,
  tax_breakdown,
  total_amount,
  paymentMethod,
  cash,
  setCash,
  change,
  handleCheckout,
  CONSTANTS,
  formatPrice,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">

            {/* Header */}
            <div className="d-flex justify-content-between border-bottom align-items-center p-3">
              <h5 className="fw-semibold">Confirm Payment</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="text-muted small ">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {tax_breakdown.map((tax, index) => (
                <div className="d-flex justify-content-between" key={index}>
                  <span>{tax.name}</span>
                  <span>{formatPrice(Number(tax.amount))}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between fw-semibold mb-2">
                <span>Total</span>
                <span style={{ color: "#f26522" }}>
                  ₹{total_amount.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>Payment</span>
                <span>
                  {paymentMethod === CONSTANTS.PAYMENT_METHODS.SCANNER
                    ? "UPI"
                    : paymentMethod === CONSTANTS.PAYMENT_METHODS.CARD
                    ? "Card"
                    : "Cash"}
                </span>
              </div>

              {/* Cash Input */}
              {paymentMethod === CONSTANTS.PAYMENT_METHODS.CASH && (
                <div className="d-flex align-items-center justify-content-between gap-2 mb-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #f26522",
                      width: "70%",
                    }}
                  />

                  <div
                    className="px-3 py-2"
                    style={{
                      backgroundColor: "#dfe8d6",
                      borderRadius: "10px",
                      minWidth: "100px",
                    }}
                  >
                    <small>
                      Change: ₹{change > 0 ? change.toFixed(0) : 0}
                    </small>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-between ">
              <button
                className="btn btn-light px-4"
                onClick={onClose}
                style={{ borderRadius: "10px" }}
              >
                Cancel
              </button>

              <button
                className="btn text-white px-4"
                onClick={() => {
                  onClose();
                  handleCheckout(true);
                }}
                style={{
                  backgroundColor: "#e05c20",
                  borderRadius: "10px",
                  fontSize:"14px"
                }}
              >
                Confirm & Print KOT
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;