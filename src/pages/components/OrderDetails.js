import React, { useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PrintTemplate from "../../components/PrintTemplate";
import { settledOrderApi, removeItemApiDineIn } from "../../features/orders/ordersApi";
import { loadTableOrders } from "../../features/cart/cartSlice";
import { setTableStatus } from "../../features/table/tableSlice";
import { getDiscounts, dineApplyDiscountApi } from "../../features/discount/discountApi";
import Alert from "../../components/Alert/Alert";
import Coupons from "../Cart/components/Coupons";
import "./OrderDetails.css"


const OrderDetails = ({
    lastOrder = {},
    setShowReceiptModal,
    printContent,
}) => {

    const receiptRef = useRef();
    const billRef = useRef();
    const dispatch = useDispatch();
    const [discounts, setDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    const [showAlert, setShowAlert] = useState({
        show: false,
        message: "",
        type: "danger",
    });
    const [paymentMethod, setPaymentMethod] = useState(
        lastOrder?.payment_method || "cash"
    );

    const [customerName, setCustomerName] = useState(
        lastOrder?.customer_name_display || lastOrder?.customerName || ""
    );

    const [customerPhone, setCustomerPhone] = useState(
        lastOrder?.customer_phone || lastOrder?.customerPhone || "9876543210"
    );
    const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);



    useEffect(() => {
        let isMounted = true;

        const loadDiscounts = async () => {
            setLoadingDiscounts(true);
            try {
                const data = await getDiscounts();
                if (isMounted) {
                    const activeDiscounts = (Array.isArray(data) ? data : data.results || []).filter(
                        (d) => d.status === "active"
                    );
                    setDiscounts(activeDiscounts);
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to load discounts", error);
                    setShowAlert({
                        show: true,
                        message: "Failed to load discounts",
                        type: "warning",
                    });
                }
            } finally {
                if (isMounted) {
                    setLoadingDiscounts(false);
                }
            }
        };
        loadDiscounts();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleCouponClick = async (coupon) => {
        try {
            const isSame = selectedDiscount?.code === coupon.code;

            if (isSame) {
                await dineApplyDiscountApi({
                    action: "remove_discount",
                    order_id: lastOrder.id,
                    table_id: lastOrder.table,
                });

                setSelectedDiscount(null);
                await dispatch(loadTableOrders(lastOrder.table)).unwrap();
                setShowAlert({
                    show: true,
                    message: "Discount removed",
                    type: "warning",
                });

                return;
            }

            await dineApplyDiscountApi({
                action: "apply_discount",
                order_id: lastOrder.id,
                table_id: lastOrder.table,
                discount_code: coupon.code,
            });

            setSelectedDiscount(coupon);
            await dispatch(loadTableOrders(lastOrder.table)).unwrap();

            setShowAlert({
                show: true,
                message: `Discount ${coupon.code} applied`,
                type: "success",
            });

        } catch (error) {
            setShowAlert({
                show: true,
                message: "Discount not valid",
                type: "danger",
            });
        }
    };

    useEffect(() => {
        if (showAlert.show) {
            const timer = setTimeout(() => {
                setShowAlert(prev => ({ ...prev, show: false }));
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showAlert.show]);

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
            fssai_number: auth?.currentRestaurant?.fssai_number || ""
        };
    };

    const { restaurant, address, gst_number, fssai_number } = restaurantName();

    const getOrderDateTime = (order) => {
        return order?.created_at || order?.time || null;
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItemApiDineIn(itemId);
             await dispatch(loadTableOrders(lastOrder.table)).unwrap();
            
        } catch (error) {
            console.log("Error removing item");
        }
    };

    if (!lastOrder || !lastOrder.items) return null;

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
                                <span>{customerName || "Guest"}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Mobile No.  </span>
                                <span>{customerPhone || "9876543210"}</span>
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

                            <div className="order-ui-items">
                                {lastOrder.items.map((item, i) => {
                                    const price =
                                        parseFloat(item.unit_price ?? item.selectedPrice ?? item.price ?? 0) || 0;

                                    return (
                                        <div className="order-ui-item" key={i}>
                                            <button className="remove-item" onClick={() => handleRemoveItem(item.id)}>×</button>

                                            <div className="item-detail">
                                                <div className="item-title">{item.name}</div>
                                                <div className="item-sub">
                                                    {item.sizeName?.trim() && `(${item.sizeName})`} ₹{price.toFixed(2)}
                                                </div>
                                            </div>

                                            {/* <div className="qty-control"> */}
                                            {/* <button>-</button> */}
                                            <div>× {item.quantity}</div>
                                            {/* <button>+</button> */}
                                            {/* </div> */}

                                            <div className="item-total">
                                                ₹{(item.finalPrice).toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>


                            {/* {lastOrder.items.map((item, i) => (<div key={i} className="receipt-item">
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
                            } */}
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
                        </div>

                        <div className="my-2">
                            <input
                                className="form-control mb-2"
                                placeholder="Customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />

                            <input
                                className="form-control"
                                placeholder="Customer phone"
                                value={customerPhone}
                                maxLength={10}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setCustomerPhone(value);
                                }}
                            />
                        </div>
                        <Coupons discounts={discounts} selected={selectedDiscount} onSelect={handleCouponClick} />

                        <div className="paymentOptions my-2">
                            {["cash", "upi", "card"].map((method) => (
                                <button
                                    key={method}
                                    className={`paymentBtn ${paymentMethod === method ? "active" : ""}`}
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    <i className={`bi bi-${method === 'CASH' ? 'cash-stack' :
                                        method === 'CARD' ? 'credit-card-2-front' : 'qr-code-scan'
                                        }`}></i>
                                    {method.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-outline-secondary w-50" style={{ borderRadius: "12px" }}
                                onClick={() => {
                                    setShowReceiptModal(false);
                                }} >
                                Close
                            </button>
                            <button
                                className="btn btn-print w-50"
                                onClick={async () => {
                                    try {
                                        if (!isValidPhone(customerPhone)) {

                                            setShowAlert({
                                                show: true,
                                                message: "Enter valid 10 digit mobile number",
                                                type: "warning",
                                            });
                                            return;
                                        }
                                        await settledOrderApi({
                                            action: "settle",
                                            order_id: lastOrder.id,
                                            payment_method: paymentMethod,
                                            customer_name: customerName,
                                            customer_phone: customerPhone,
                                        });

                                        if (window.electronAPI) {
                                            const content = billRef.current.innerHTML;
                                            window.electronAPI.printBill(content);
                                        } else {
                                            printContent(billRef);
                                        }

                                        setShowReceiptModal(false);

                                        dispatch(setTableStatus({
                                            id: lastOrder.table,
                                            status: "available",
                                        }));

                                    } catch (error) {
                                        console.error("Settle failed:", error);
                                        alert("Failed to settle order");
                                    }
                                }}
                            >
                                Settled & Print
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
                        paymentMethod={paymentMethod}
                        restaurant={restaurant}
                        gst_number={gst_number}
                        fssai_number={fssai_number}
                        customerName={customerName || "Guest"}
                        customerPhone={customerPhone}
                        customerAddress={lastOrder?.customer_address}
                        orderNotes={lastOrder?.order_notes}
                        discountAmount={lastOrder?.discount_amount}
                        restaurantAddress={address}
                        orderNumber={lastOrder?.daily_number}
                    />
                </div>
            </div>

            <Alert
                show={showAlert.show}
                message={showAlert.message}
                type={showAlert.type}
                onClose={() => setShowAlert({ ...showAlert, show: false })}
            />
        </>
    );
};

export default OrderDetails;