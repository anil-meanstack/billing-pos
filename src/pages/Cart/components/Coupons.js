import React, { useState } from "react";

const Coupons = (props) => {
    const discounts = props.discounts || [];
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");

  const handleClose = () => setShowModal(false);

  const handleSave = () => {
    props.onSaveNote(note);
    setShowModal(false);
  };
  return (
    <div className="coupon-section">
      <p className="title mb-0">COUPONS — TAP TO APPLY</p>
      {discounts.length === 0 && (
        <p className="mb-0" style={{ textAlign: "center", color: "#888", fontSize:"12px" }}>
          No offers available
        </p>
      )}

      <div className="coupon-grid my-2">
       {discounts.map((c, i) => (
          <div
            key={i}
            className={`coupon-card ${props.disabled ? "disabled" : ""} ${c.color} 
                        ${props.selected?.code === c.code ? "selected" : ""}
                      `}
            onClick={() => {
              props.onSelect(c);
            }}
          >
            <div>
              <div className="code">{c.code}</div>
              <div className="desc">{c.description}</div>
            </div>

            {c.savings && (
              <div className="save">Save {c.savings}</div>
            )}
          </div>
        ))}
      </div>

      <div className="note-box" onClick={() => setShowModal(true)}>
        + Add order note / special request
      </div>


      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={handleClose}
          ></div>

          <div
            className="modal d-block"
            tabIndex="100"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 ">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-1 p-3 border-bottom">
                  <h5 className="modal-title fw-semibold text-dark">Order Note</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleClose}
                  ></button>
                </div>

                {/* Body */}
                <div className="mb-3 p-3">
                  <label htmlFor="note" className="form-label text-muted " style={{fontSize:"11px"}}>
                    Special instructions for kitchen
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="e.g. Less spicy, no onions, extra sauce..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                      borderRadius: "12px",
                      backgroundColor: "#f8f9fa",
                      fontSize:"12px"
                    }}
                  ></textarea>
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-between gap-2 p-3 border-top">
                  <button
                    className="btn btn-light w-50 px-4 border"
                    onClick={handleClose}
                    style={{ borderRadius: "10px" ,background:"#fff"}}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn px-4 w-50 text-white"
                    onClick={handleSave}
                    style={{
                      backgroundColor: "#e05c20",
                      borderRadius: "10px",
                    }}
                  >
                    Save Note
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
};

export default Coupons;