import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import PrintTemplate from "../../components/PrintTemplate";

const OrderDetailsModal = ({
    lastOrder = {},
    setShowReceiptModal,
    printContent,
}) => {
    const navigate = useNavigate();
    const receiptRef = useRef();
    const billRef = useRef();
    if (!lastOrder || !lastOrder.items) return null;

    const getAuthData = () => {
        const data = localStorage.getItem("user");
        if (!data) return null;

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("Invalid user data in localStorage");
            return null;
        }
    };

    const restaurantName = () => {
        const auth = getAuthData();
        return {
            restaurant: auth?.currentRestaurant?.name || "No Restaurant Selected",
            address: auth?.currentRestaurant?.address || "",
            gst_number: auth?.currentRestaurant?.gst_number || "",
            fssai_number:auth?.currentRestaurant?.fssai_number || ""
        };
    };

    const { restaurant, address, gst_number ,fssai_number} = restaurantName();

    const getOrderDateTime = (order) => {
        return order?.created_at || order?.time || null;
    };

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal d-block">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content receipt-card">
                        <div id="print-area" ref={receiptRef}>
                            <div className="text-center mb-2">
                                <h5 className="fw-bold mb-0">{restaurant}</h5>
                                <p className="receipt-address"> {address} </p>
                            </div>
                            <div className="divider" />
                            <div className="receipt-row">
                                <span>Name </span>
                                <span>{lastOrder?.customer_name_display ?? lastOrder?.customerName}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Mobile No.  </span>
                                <span>{lastOrder?.customer_phone ?? lastOrder?.customerPhone}</span>
                            </div>
                            <div className="divider" />
                            <div className="receipt-row">
                                <span>Order No - </span>
                                <span>#{lastOrder?.daily_number}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Order Type</span>
                                <span>
                                    {lastOrder?.order_type_display ?? lastOrder?.orderType}
                                </span>
                            </div>
                            {lastOrder.order_type && lastOrder.orderType !== "takeaway" && lastOrder.order_type && lastOrder.orderType !== "delivery" && (
                                <div className="receipt-row">
                                    <span>Table</span>
                                    <span>
                                        {lastOrder?.tableNumber ?? lastOrder?.table_number ?? "-"}
                                    </span>
                                </div>
                            )}

                            <div className="receipt-row">
                                <span>Date & Time</span>
                                <span>
                                    {getOrderDateTime(lastOrder)
                                        ? new Date(getOrderDateTime(lastOrder)).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "-"}
                                </span>
                            </div>
                            <div className="divider" />

                            {lastOrder.items.map((item, i) => (<div key={i} className="receipt-item">
                                <div className="receipt-row">
                                    <span className="item-name"> {item.name}{" "} {item.sizeName?.trim() && `(${item.sizeName})`} × {item.quantity}
                                    </span> <span className="item-price"> ₹{(parseFloat(item.finalPrice ?? item.selectedPrice ?? item.price ?? 0) || 0).toFixed(2)} </span>
                                </div>
                                {item.addons?.length > 0 && (
                                    <div className="addons">
                                        {item.addons.map((addon) => (
                                            <div key={addon.id}>+ {addon.name}
                                            </div>
                                        )
                                        )}
                                    </div>
                                )}
                            </div>))
                            }
                            {(lastOrder?.order_notes || lastOrder?.orderNote) && (
                                <>
                                    <div className="divider" />

                                    <div className="fw-semibold text-uppercase ">
                                        <span style={{ fontWeight: "bold", fontSize: "12px" }}>Note:-</span>
                                        <span style={{ textAlign: "right", fontSize: "12px" }}>
                                            {lastOrder?.order_notes ?? lastOrder?.orderNote}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="divider" />
                            <div className="receipt-row">
                                <span>Subtotal</span>
                                <span>₹{(parseFloat(lastOrder.subtotal) || 0).toFixed(2)}</span>
                            </div>
                            {lastOrder.tax_breakdown?.map((tax, i) => (
                                <div key={i} className="receipt-row">
                                    <span>{tax.name}</span>
                                    <span>₹{(parseFloat(tax.amount) || 0).toFixed(2)}</span>
                                </div>
                            ))
                            }
                            {lastOrder?.discount_amount !== 0 && (
                                <div className="receipt-row  ">
                                    <span >Discount</span>
                                    <span >
                                        ₹{lastOrder?.discount_amount}
                                    </span>
                                </div>
                            )}

                            <div className="divider thick" />
                            <div className="receipt-row total">
                                <span>TOTAL</span>
                                <span>₹{(parseFloat(lastOrder.total_amount) || 0).toFixed(2)}</span>
                            </div>
                            <div className="receipt-row payment">
                                <span>Payment</span>
                                <span>{lastOrder.paymentMethod ?? lastOrder.payment_method_display ?? "-"}</span>
                            </div>
                            <p className="text-center thank-you"> Thank you 🙏 </p>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-outline-secondary w-50" style={{ borderRadius: "12px" }}
                                onClick={() => {
                                    setShowReceiptModal(false);
                                    navigate("/order");
                                }} >
                                Close
                            </button>
                            <button className="btn btn-print w-50" onClick={() => {
                                if (window.electronAPI) {
                                    const content = billRef.current.innerHTML;
                                    window.electronAPI.printBill(content);
                                    setShowReceiptModal(false);
                                } else {
                                    printContent(billRef);

                                }
                            }} >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: "fixed", top: 0, left: 0, opacity: 0, pointerEvents: "none" }}  >
                <div ref={billRef}>
                    <PrintTemplate
                        type="bill"
                        items={lastOrder.items}
                        tableNumber={lastOrder.tableNumber ?? lastOrder.table_number}
                        orderType={lastOrder.order_type_display ?? lastOrder.orderType}
                        subtotal={lastOrder.subtotal}
                        tax_breakdown={lastOrder.tax_breakdown}
                        total_amount={lastOrder.total_amount}
                        paymentMethod={lastOrder.paymentMethod ?? lastOrder.payment_method_display}
                        restaurant={restaurant}
                        gst_number={gst_number}
                        fssai_number={fssai_number}
                        customerName={lastOrder?.customer_name_display ?? lastOrder?.customerName }
                        customerPhone={lastOrder?.customer_phone ?? lastOrder?.customerPhone }
                        customerAddress={lastOrder?.customer_address}
                        orderNotes={lastOrder?.order_notes}
                        discountAmount={lastOrder?.discount_amount}
                        restaurantAddress={address}
                        orderNumber={lastOrder?.daily_number}
                    />
                </div>
            </div>
        </>
    );
};

export default OrderDetailsModal;