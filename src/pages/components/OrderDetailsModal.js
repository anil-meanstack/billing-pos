import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import PrintTemplate from "../../components/PrintTemplate";

const OrderDetailsModal = ({
    lastOrder = {},
    setShowReceiptModal,
    printContent,
}) => {
    const navigate = useNavigate();
    const printRef = useRef();
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
        };
    };

    const { restaurant, address } = restaurantName();

    const getOrderDateTime = (order) => {
        return order?.created_at || order?.time || null;
    };

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal d-block">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content receipt-card">
                        <div id="print-area" ref={printRef}>
                            <div className="text-center mb-2">
                                <h5 className="fw-bold mb-0">{restaurant}</h5>
                                <p className="receipt-address"> {address} </p>
                            </div> <div className="divider" />
                            <div className="receipt-row">
                                <span>Table</span>
                                <span>{lastOrder?.tableNumber ?? lastOrder?.table_number ?? "-"}</span>
                            </div>
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
                                    </span> <span className="item-price"> ₹{(parseFloat(item.finalPrice ?? item.price ?? 0) || 0).toFixed(2)} </span>
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
                            {lastOrder?.discount_amount != 0 && (
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
                                    const content = printRef.current.innerHTML;
                                    window.electronAPI.printBill(content);
                                    setShowReceiptModal(false);
                                } else {
                                    printContent(printRef);

                                }
                            }} >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <div style={{ position: "absolute", left: "-9999px" }}>
                <div ref={printRef}>
                    <PrintTemplate
                        type="bill"
                        items={lastOrder.items}
                        tableNumber={lastOrder.tableNumber}
                        orderType={lastOrder.orderType}
                        subtotal={lastOrder.subtotal}
                        tax_breakdown={lastOrder.tax_breakdown}
                        total_amount={lastOrder.total_amount}
                        paymentMethod={lastOrder.paymentMethod}
                        restaurant={restaurant}
                        customerName={lastOrder?.customerName}
                        customerPhone={lastOrder?.customerPhone}
                        orderNotes={lastOrder?.order_notes}
                        discountAmount={lastOrder?.discount_amount}
                    />
                </div>
            </div>
        </>
    );
};

export default OrderDetailsModal;