import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./components/CustomerModal";
import Alert from "../../components/Alert/Alert";
import { getDiscounts } from "../../features/discount/discountApi";
import "./CartSummary.css";
import { clearCartServer, setOrderType, setCustomerInfo, selectCartTotal, selectItemCount, updateTable, applyDiscount, removeDiscount } from "../../features/cart/cartSlice";
import { setTableStatus } from "../../features/table/tableSlice";
import { checkoutOrder } from "../../features/orders/ordersSlice";
import CartItem from "./components/CartItem";
import Coupons from "./components/Coupons"
import PrintTemplate from "../../components/PrintTemplate";
import OrderDetailsModal from "../components/OrderDetailsModal";
import CancelModal from "../menu/components/Modal/CancelModal";
import PaymentModal from "./components/PaymentModal";

// Constants
const CONSTANTS = {
  PHONE_REGEX: /^\d{10}$/,
  PAYMENT_METHODS: {
    CASH: 'cash',
    SCANNER: 'upi',
    CARD: 'card',
  },
  ORDER_TYPES: {
    DINE_IN: 'dine_in',
    TAKEAWAY: 'takeaway',
    DELIVERY: 'delivery'
  }
};

const CartSummary = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tableId } = props;

  const [placingOrder, setPlacingOrder] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(CONSTANTS.PAYMENT_METHODS.CASH);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [containerCharge, setContainerCharge] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const selectedTableId = useSelector((state) => state.cart.tableId);
  const [orderNote, setOrderNote] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const cartData = useSelector((state) => state.cart.cartData);
  const [cash, setCash] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const tables = useSelector((state) => state.tables.list);


  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  const kotRef = useRef();
  const billRef = useRef();

  const { items, cartId, tableNumber, customerInfo, orderType, cartSummary } = useSelector((state) => state.cart);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  const total = useSelector(selectCartTotal);
  const itemCountFromSelector = useSelector(selectItemCount);

  const isDineIn = orderType === CONSTANTS.ORDER_TYPES.DINE_IN;
  const isDelivery = orderType === CONSTANTS.ORDER_TYPES.DELIVERY;
  const isCartEmpty = items.length === 0;
  const tax_breakdown = useMemo(() => cartData?.tax_breakdown || [],
    [cartData?.tax_breakdown]
  )

  const subtotal = useMemo(() => {
    if (items.length === 0) return 0;

    return cartSummary?.subtotal
      ? Number(cartSummary.subtotal)
      : total;
  }, [cartSummary, total, items.length]);


  const taxAmount = useMemo(() => {
    if (items.length === 0) return 0;

    return tax_breakdown.reduce((total, tax) => {
      return total + Number(tax.amount || 0);
    }, 0);
  }, [tax_breakdown, items.length]);


  useEffect(() => {
    if (!orderType) {
      dispatch(setOrderType(CONSTANTS.ORDER_TYPES.DINE_IN));
    }
  }, [dispatch, orderType]);

  const discountAmount = useMemo(() =>
    Number(cartSummary?.discountAmount) || 0,
    [cartSummary]
  );
  const deliveryChargeFromSummary = useMemo(() =>
    cartSummary?.delivery_charge ?? deliveryCharge,
    [cartSummary?.delivery_charge, deliveryCharge]
  );

  const total_amount = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal + taxAmount - discountAmount + deliveryChargeFromSummary + containerCharge
  },
    [subtotal, taxAmount, discountAmount, deliveryChargeFromSummary, containerCharge, items.length]
  );

  const itemCount = useMemo(() =>
    cartSummary?.itemCount || itemCountFromSelector,
    [cartSummary?.itemCount, itemCountFromSelector]
  );

  const change = useMemo(() => {
    const paid = parseFloat(cash) || 0;
    return paid - total_amount;
  }, [cash, total_amount]);

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
  const getAuth = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const formatPrice = useCallback((price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return "₹0.00";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(2)}`;
  }, []);

  const showError = useCallback((message) => {
    setShowAlert({
      show: true,
      message,
      type: "danger",
    });
  }, []);

  const showSuccess = useCallback((message) => {
    setShowAlert({
      show: true,
      message,
      type: "success",
    });
  }, []);

  const validateCustomerInfo = useCallback(() => {
    if (orderType === CONSTANTS.ORDER_TYPES.DINE_IN) {
      return true;
    }

    if (!customerInfo.name?.trim()) {
      setShowCustomerModal(true);
      showError("Customer name is required");
      return false;
    }

    if (!customerInfo.phone?.trim()) {
      setShowCustomerModal(true);
      showError("Phone number is required");
      return false;
    }

    const cleanPhone = customerInfo.phone.replace(/\D/g, '');
    if (!CONSTANTS.PHONE_REGEX.test(cleanPhone)) {
      setShowCustomerModal(true);
      showError("Enter valid 10-digit phone number");
      return false;
    }

    if (isDelivery && !customerInfo.address?.trim()) {
      setShowCustomerModal(true);
      showError("Address is required");
      return false;
    }

    return true;
  }, [customerInfo, isDelivery, orderType, showError]);

  useEffect(() => {
    if (orderType === CONSTANTS.ORDER_TYPES.DINE_IN) {
      dispatch(setCustomerInfo({
        name: "Guest",
        phone: "9876543210",
        address: ""
      }));
    }
  }, [orderType, dispatch]);

  useEffect(() => {
    if (!cartSummary || discounts.length === 0) {
      setSelectedDiscount(null);
      return;
    }

    if (cartSummary.discount_code) {
      const matched = discounts.find(
        d => d.code === cartSummary.discount_code
      );

      setSelectedDiscount(matched || null);
    } else {
      setSelectedDiscount(null);
    }
  }, [cartSummary, discounts]);

  const validateCheckout = useCallback(() => {
    if (items.length === 0) {
      showError("Your cart is empty! Please add items first.");
      return false;
    }

    if (!validateCustomerInfo()) {
      return false;
    }

    if (isDineIn) {
      if (!tableNumber || !selectedTableId) {
        showError("Table number is required");
        return false;
      }

      const selectedTable = tables.find(t => t.id === selectedTableId);

      if (!selectedTable) {
        showError("Selected table not found");
        return false;
      }
    }

    return true;
  }, [items.length, validateCustomerInfo, isDineIn, tableNumber, selectedTableId, tables, showError]);


  const handleOrderTypeChange = useCallback((type) => {

    if (
      type === CONSTANTS.ORDER_TYPES.DINE_IN &&
      !selectedTableId
    ) {
      showError("Please select a table first");
      return;
    }
    dispatch(setOrderType(type));

    if (type === CONSTANTS.ORDER_TYPES.DINE_IN) return;

    dispatch(updateTable({
      order_type: type
    }));

  }, [dispatch, selectedTableId, showError]);

  const handleCheckout = useCallback(async (shouldPrint = false) => {

    if (!validateCheckout()) return;

    setPlacingOrder(true);

    const finalAmount = total_amount;
    const auth = getAuth();
    const restaurantId = auth?.currentRestaurant?.id || auth?.restaurant?.id;

    if (!restaurantId) {
      showError("Restaurant not found. Please login again.");
      setPlacingOrder(false);
      return;
    }

    const apiOrderType = orderType === CONSTANTS.ORDER_TYPES.DINE_IN ? "dine_in" : orderType;

    const orderData = {
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: isDelivery ? customerInfo.address : null,
      order_type_display: apiOrderType,
      order_type: apiOrderType,
      table_id: isDineIn ? selectedTableId : null,
      tableNumber: isDineIn ? selectedTableId : null,
      table_number: isDineIn ? tableNumber : null,
      order_total: cartSummary?.total_amount || Math.round(finalAmount),
      order_status: "confirmed",
      payment_method: paymentMethod,
      cart_id: cartId,
      restaurant_id: restaurantId,
      discount_id: selectedDiscount?.id || null,
      special_instructions: orderNote || null,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price || 0),
        finalPrice: Number(item.finalPrice || item.price || 0),
        addons: item.addons || [],
        sizeName: item.sizeName || ""
      }))
    };

    try {
      const result = await dispatch(checkoutOrder(orderData)).unwrap();

      // if (shouldPrint) {
      //   await new Promise(resolve => setTimeout(resolve, 100));

      //   if (window.electronAPI) {
      //     const content = kotRef.current.innerHTML;
      //     window.electronAPI.printKot(content);
      //   } else {
      //     printContent(kotRef);

      //   }
      // }

      setLastOrder({
        items,
        discount_amount: discountAmount,
        total_amount,
        subtotal,
        tax_breakdown: cartData?.tax_breakdown || [],
        tableNumber,
        orderType,
        daily_number: result.daily_number,
        paymentMethod,
        time: new Date(),
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        orderNotes: orderNote,
      });

      setShowReceiptModal(true);

      dispatch(setCustomerInfo({
        name: "",
        phone: "",
        address: ""
      }));

      if (isDineIn && selectedTableId) {
        dispatch(
          setTableStatus({
            id: selectedTableId,
            status: "occupied",
            amount: finalAmount,
            orderId: result?.id,
          }),
        );
      }
      await dispatch(clearCartServer({
        order_type: orderType,
        table_id: selectedTableId || null
      }));
      setSelectedDiscount(null);
      setDeliveryCharge(0);
      setContainerCharge(0);

      showSuccess("Order Placed Successfully ✅");
    } catch (error) {
      console.error("Checkout Error:", error);
      showError(error.message || "Order Failed. Please Try Again!");
    } finally {
      setPlacingOrder(false);
    }
  },
    [validateCheckout, total_amount, getAuth, orderType, customerInfo, isDelivery,
      isDineIn, tableNumber, paymentMethod, cartId, selectedDiscount, items,
      dispatch, tableId, navigate, showError, showSuccess, orderNote, selectedTableId, subtotal, discountAmount, cartSummary?.total_amount, tax_breakdown]);


  const printContent = (ref) => {
    if (!ref?.current) {
      console.error("Nothing to print");
      return;
    }

    const content = ref.current.innerHTML;

    const win = window.open("", "", "width=400");

    win.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: monospace; padding:10px; }
          hr { border-top:1px dashed #000; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);

    win.document.close();

    win.onload = () => {
      win.print();
      win.close();
    };
  };

  useEffect(() => {
    const removeDiscountIfCartEmpty = async () => {
      if (items.length === 0 && selectedDiscount?.code) {
        try {
          await dispatch(removeDiscount({
            order_type: orderType,
            table_id: selectedTableId
          }));
          setSelectedDiscount(null);

          showSuccess("Discount removed (empty cart)");
        } catch (error) {
          console.error("Failed to remove discount", error);
        }
      }
    };

    removeDiscountIfCartEmpty();
  }, [items.length, selectedDiscount, dispatch, showSuccess, orderType, selectedTableId]);

  const handleCouponClick = async (coupon) => {
    if (isCartEmpty) {
      showError("Add items to cart before applying discount");
      return;
    }

    try {
      const isSame =
        selectedDiscount?.code === coupon.code ||
        cartSummary?.discount_code === coupon.code;

      if (isSame) {
        await dispatch(removeDiscount({
          order_type: orderType,
          table_id: selectedTableId || null
        })).unwrap();

        setSelectedDiscount(null); // immediate UI update
        showSuccess("Discount removed");
        return;
      }

      const payload = {
        order_type: orderType,
        discount_code: coupon.code
      };

      if (orderType === "dine_in" && selectedTableId) {
        payload.table_id = selectedTableId;
      }

      await dispatch(applyDiscount(payload)).unwrap();

      setSelectedDiscount(coupon);
      showSuccess(`Discount ${coupon.code} applied`);

    } catch (error) {
      console.error(error);

      showError(
        error?.message ||
        error?.response?.data?.message ||
        "Discount not valid at this time"
      );
    }
  };

  const handleCancel = useCallback(async () => {

    const payload = {
      order_type: orderType || "dine_in",
    };

    if (orderType === "dine_in" && tableId) {
      payload.table_id = tableId;
    }

    if (items.length > 0) {
      setShowCancelConfirm(true);
      return;
    }

    await dispatch(clearCartServer(payload));
    setDeliveryCharge(0);
    setContainerCharge(0);
    setSelectedDiscount(null);
  }, [items.length, dispatch, orderType, tableId]);

  const kotPrint = async () => {
    if (items.length === 0) {
      showError("Cart is empty!");
      return;
    }

    if (!validateCheckout()) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (window.electronAPI) {
        const content = kotRef.current.innerHTML;
        window.electronAPI.printKot(content);
      } else {
        printContent(kotRef);
      }
      if (isDineIn && selectedTableId) {
        dispatch(
          setTableStatus({
            id: selectedTableId,
            status: "occupied",
          }),
        );
      }
      showSuccess("KOT Printed ✅");

    } catch (error) {
      console.error(error);
      showError("Failed to print KOT");
    }
  };

  return (
    <>
      <div className="orderCard">
        <div className="orderHeader p-2">
          <h2 className="orderTitle">Current Order</h2>
          <i
            className="bi bi-person-circle "
            style={{ cursor: "pointer", fontSize: "20px" }}
            onClick={() => setShowCustomerModal(true)}
          ></i>
          <button className="oclr" onClick={handleCancel}>Clear all</button >
        </div>
        <div className="px-2">
          <div className="orderTypeSwitch mb-1 ">
            {Object.values(CONSTANTS.ORDER_TYPES).map((type) => (
              <button
                key={type}
                className={`orderTypeBtn ${orderType === type ? "active" : ""}`}
                onClick={() => handleOrderTypeChange(type)}
              >
                {type === CONSTANTS.ORDER_TYPES.DINE_IN ? "Dine in" :
                  type === CONSTANTS.ORDER_TYPES.TAKEAWAY ? "Take Away" : "Delivery"}
              </button>
            ))}
          </div>
        </div>

        <div className={`cartContainer p-2 ${items.length === 0 ? "empty" : ""}`}>
          {items.length === 0 ? (
            <div className="text-center py-3">
              <span style={{ fontSize: "50px", opacity: ".3", marginBottom: "6px" }}>🛒</span>
              <h6 style={{ fontSize: "13px", color: "#68665c", fontWeight: "500" }}>No items yet</h6>
              <h6 style={{ fontSize: "13px", color: "#68665c", fontWeight: "500" }}>Tap any dish to add it here</h6>
            </div>
          ) : (

            items.map((item, index) => (
              <CartItem key={`${item.id}-${index}`} item={item} />
            ))
          )}
        </div>

        <div className="totalContainer">
          <div className="totalRow">
            <span>Subtotal ({itemCount})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {tax_breakdown.length > 0 &&
            tax_breakdown.map((tax, index) => (
              <div className="totalRow" key={index}>
                <span>{tax.name}</span>
                <span>{formatPrice(Number(tax.amount))}</span>
              </div>
            ))
          }
          {discountAmount > 0 && (
            <div className="totalRow text-success">
              <span className="d-flex gap-2 align-items-center">Discount {cartSummary?.discount_code ? `(${cartSummary.discount_code})` : ''}</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          {deliveryChargeFromSummary > 0 && (
            <div className="totalRow">
              <span>Delivery Charge</span>
              <span>{formatPrice(deliveryChargeFromSummary)}</span>
            </div>
          )}

          {containerCharge > 0 && (
            <div className="totalRow">
              <span>Container Charge</span>
              <span>{formatPrice(containerCharge)}</span>
            </div>
          )}

          <div className="grandTotal">
            <strong>TOTAL</strong>
            <strong style={{ color: "#e05c20" }}>{formatPrice(total_amount)}</strong>
          </div>
          {loadingDiscounts && <span>Loading discounts...</span>}
          <Coupons discounts={discounts} selected={selectedDiscount} onSelect={handleCouponClick} onSaveNote={setOrderNote} disabled={isCartEmpty} />

          <div className="paymentMethodBox">
            <div className="paymentOptions">
              {Object.values(CONSTANTS.PAYMENT_METHODS).map((method) => (
                <button
                  key={method}
                  className={`paymentBtn ${paymentMethod === method ? "active" : ""}`}
                  onClick={() => setPaymentMethod(method)}
                  aria-label={`Pay by ${method}`}
                >
                  <i className={`bi bi-${method === 'CASH' ? 'cash-stack' :
                    method === 'CARD' ? 'credit-card-2-front' : 'qr-code-scan'
                    }`}></i>
                  <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="checkoutButtonsContainer">
            <button className="place-order-btn" onClick={kotPrint}>🧾 KOT & Print </button>
            <button
              className="place-order-btn"
              onClick={() => setShowPaymentModal(true)}
              disabled={placingOrder || orderLoading || isCartEmpty}
            >
              {placingOrder || orderLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <span className="btn-texts">Place Order</span>
                  {/* <span className="btn-amount">{formatPrice(total_amount)}</span> */}
                </>
              )}
            </button>
          </div>

        </div>

        <Alert
          show={showAlert.show}
          message={showAlert.message}
          type={showAlert.type}
          onClose={() => setShowAlert({ ...showAlert, show: false })}
        />

        {showCancelConfirm && (
          <CancelModal show={showCancelConfirm}
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={async () => {
              const payload = {
                order_type: orderType || "dine_in",
              };
              if (orderType === "dine_in" && selectedTableId) {
                payload.table_id = selectedTableId;
              }

              await dispatch(clearCartServer(payload));
              setShowCancelConfirm(false);
            }}
            message="All items will be removed from cart."
          />
        )}

        <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} subtotal={subtotal} tax_breakdown={tax_breakdown} total_amount={total_amount}
          paymentMethod={paymentMethod} cash={cash} setCash={setCash} change={change} handleCheckout={handleCheckout} CONSTANTS={CONSTANTS} formatPrice={formatPrice} />

        <div style={{ position: "fixed", top: 0, left: 0, opacity: 0, pointerEvents: "none" }} >
          <div ref={kotRef}>
            <PrintTemplate type="kot" items={items} tableNumber={tableNumber} orderType={orderType} itemCount={itemCount} orderNotes={orderNote} />
          </div>
        </div>

        {showReceiptModal && lastOrder && (
          <OrderDetailsModal lastOrder={lastOrder} setShowReceiptModal={setShowReceiptModal} printContent={printContent} billRef={billRef} />
        )}
      </div>

      {showCustomerModal && (
        <CustomerModal orderType={orderType} customerInfo={customerInfo} dispatch={dispatch} onClose={() => setShowCustomerModal(false)} onPlaceOrder={handleCheckout} />
      )}
    </>
  );
};

export default CartSummary;