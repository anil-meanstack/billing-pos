const OrderDetails = (props) => {
  if (!props.selectedOrder) return null;

  // Helper function to safely get item name
  const getItemName = (item) => {
    return item.menu_item_name || item.name || "Unknown Item";
  };

  // Helper function to get item price
  const getItemPrice = (item) => {
    return Number(item.unit_price || item.price || 0);
  };

  // Helper function to get item quantity
  const getItemQuantity = (item) => {
    return item.quantity || 1;
  };

  // Helper function to get item variant
  const getItemVariant = (item) => {
    if (item.variant_selections && item.variant_selections.length > 0) {
      return item.variant_selections[0].variant_name;
    }
    return item.variant || "Regular";
  };

  // Get items array safely
  const items = props.selectedOrder.items || [];

  return (
    <div className="order-details-overlay" onClick={props.onClose}>
      <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="od-header">
          <div className="od-title">
            <i className="bi bi-receipt"></i>
            <div>
              <h3>Order #{props.selectedOrder.order_number}</h3>
              <span className="od-date">
                {props.formatDate(props.selectedOrder.created_at)}
              </span>
            </div>
          </div>

          <button className="od-close" onClick={props.onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="od-body">
          {/* Order Info Card */}
          <div className="od-card">
            <h4>
              <i className="bi bi-info-circle"></i> Order Info
            </h4>

            <div className="od-grid">
              <div>
                <label>Status</label>
                <span
                  className={`status-badge ${props.getStatusClass(
                    props.selectedOrder.status_display || props.selectedOrder.status
                  )}`}
                >
                  {props.selectedOrder.status_display || props.selectedOrder.status}
                </span>
              </div>

              <div>
                <label>Order Type</label>
                <span className="type-badge">
                  {props.getOrderTypeIcon(props.selectedOrder.order_type)}
                  {props.selectedOrder.order_type_display || props.selectedOrder.order_type}
                </span>
              </div>

              <div>
                <label>Payment</label>
                <span>
                  {props.selectedOrder.payment_method_display ||
                    props.selectedOrder.payment_method ||
                    "N/A"}
                </span>
              </div>

              <div>
                <label>Payment Status</label>
                <span>
                  {props.selectedOrder.payment_status_display ||
                    props.selectedOrder.payment_status ||
                    "N/A"}
                </span>
              </div>

              {props.selectedOrder.table_number && (
                <div>
                  <label>Table</label>
                  <span>Table {props.selectedOrder.table_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Card */}
          <div className="od-card">
            <h4>
              <i className="bi bi-person"></i> Customer
            </h4>

            <div className="od-grid">
              <div>
                <label>Name</label>
                <span>
                  {props.selectedOrder.customer_name ||
                    props.selectedOrder.customer?.name ||
                    "N/A"}
                </span>
              </div>

              <div>
                <label>Phone</label>
                <span>
                  {props.selectedOrder.customer_phone ||
                    props.selectedOrder.customer?.phone ||
                    "N/A"}
                </span>
              </div>

              {props.selectedOrder.customer_email && (
                <div>
                  <label>Email</label>
                  <span>{props.selectedOrder.customer_email}</span>
                </div>
              )}

              {props.selectedOrder.delivery_address && (
                <div className="full-width">
                  <label>Delivery Address</label>
                  <span>{props.selectedOrder.delivery_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Card */}
          <div className="od-card">
            <h4>
              <i className="bi bi-basket"></i> Items
            </h4>

            <div className="od-items">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div className="od-item-row" key={item.id || index}>
                    <div className="item-info" style={{width:"300px",maxWidth:"300px"}}>
                      <strong>{getItemName(item)}</strong>
                      <small>{getItemVariant(item)}</small>
                      {item.special_instructions && (
                        <small className="item-notes">
                          Note: {item.special_instructions}
                        </small>
                      )}
                    </div>

                    <div className="item-qty">x{getItemQuantity(item)}</div>
                    <div className="item-price">
                      {props.formatCurrency(
                        getItemPrice(item) * getItemQuantity(item)
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-items">No items found</div>
              )}

              {/* Totals Section */}
              <div className="od-totals">
                <div className="total-row d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>{props.formatCurrency(props.selectedOrder.subtotal || 0)}</span>
                </div>
                
                {Number(props.selectedOrder.tax_amount) > 0 && (
                  <div className="total-row d-flex justify-content-between">
                    <span>Tax</span>
                    <span>{props.formatCurrency(props.selectedOrder.tax_amount)}</span>
                  </div>
                )}
                
                {Number(props.selectedOrder.discount_amount) > 0 && (
                  <div className="total-row discount d-flex justify-content-between">
                    <span>Discount</span>
                    <span>-{props.formatCurrency(props.selectedOrder.discount_amount)}</span>
                  </div>
                )}
                
                {Number(props.selectedOrder.delivery_charge) > 0 && (
                  <div className="total-row d-flex justify-content-between">
                    <span>Delivery Charge</span>
                    <span>{props.formatCurrency(props.selectedOrder.delivery_charge)}</span>
                  </div>
                )}
                
                <div className="total-row grand-total d-flex justify-content-between">
                  <span>Total</span>
                  <strong>
                    {props.formatCurrency(
                      props.selectedOrder.total_amount || props.getOrderTotal(props.selectedOrder)
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline/Status History - Optional */}
          {(props.selectedOrder.confirmed_at ||
            props.selectedOrder.preparing_at ||
            props.selectedOrder.ready_at ||
            props.selectedOrder.delivered_at) && (
            <div className="od-card">
              <h4>
                <i className="bi bi-clock-history"></i> Timeline
              </h4>
              <div className="timeline">
                {props.selectedOrder.confirmed_at && (
                  <div className="timeline-item">
                    <span className="time">
                      {props.formatDate(props.selectedOrder.confirmed_at)}
                    </span>
                    <span className="event">Order Confirmed</span>
                  </div>
                )}
                {props.selectedOrder.preparing_at && (
                  <div className="timeline-item">
                    <span className="time">
                      {props.formatDate(props.selectedOrder.preparing_at)}
                    </span>
                    <span className="event">Preparing</span>
                  </div>
                )}
                {props.selectedOrder.ready_at && (
                  <div className="timeline-item">
                    <span className="time">
                      {props.formatDate(props.selectedOrder.ready_at)}
                    </span>
                    <span className="event">Ready for pickup/delivery</span>
                  </div>
                )}
                {props.selectedOrder.delivered_at && (
                  <div className="timeline-item">
                    <span className="time">
                      {props.formatDate(props.selectedOrder.delivered_at)}
                    </span>
                    <span className="event">Delivered</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="od-footer">
          <button className="btn-light" onClick={props.onClose}>
            Close
          </button>

          <button className="btn-primary">
            <i className="bi bi-download"></i>
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;