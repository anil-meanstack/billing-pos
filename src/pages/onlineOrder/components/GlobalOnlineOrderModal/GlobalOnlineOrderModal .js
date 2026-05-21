import React, { useCallback, useEffect, useRef, useState } from "react";
import PrintTemplate from "../../../../components/PrintTemplate";
import "./GlobalOnlineOrderModal.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SOUND_PATH = "sounds/online-order.mp3";

const demoOrder = {
  id: Date.now(),
  source: "zomato",
  external_order_id: "ZOM-10245",
  status: "pending",
  customer_name: "Rahul Sharma",
  customer_phone: "9876543210",
  order_type: "delivery",
  payment_method: "online",
  created_at: new Date().toISOString(),
  subtotal: 499,
  tax_amount: 24.95,
  total_amount: 523.95,
  address: "Sector 45, Gurgaon",
  note: "Please add tissue",
  items: [
    {
      id: 101,
      name: "Paneer Pizza",
      quantity: 1,
      price: 299,
      variant_name: "Large",
      addons: [{ name: "Extra Cheese", price: 40 }],
      note: "Extra spicy",
    },
  ],
};

const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

const normalizeOrdersResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
};

const getRiderName = (order) =>
  order?.rider_name ||
  order?.delivery_rider_name ||
  order?.rider?.name ||
  order?.delivery_partner?.name ||
  "";

const getRiderPhone = (order) =>
  order?.rider_phone ||
  order?.delivery_rider_phone ||
  order?.rider?.phone ||
  order?.delivery_partner?.phone ||
  "";

const isRiderAssigned = (order) =>
  Boolean(getRiderName(order) || getRiderPhone(order) || order?.rider_id);

const GlobalOnlineOrderModal = () => {
  const [newOrder, setNewOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  const [printOrder, setPrintOrder] = useState(null);

  const audioRef = useRef(null);
  const isRingingRef = useRef(false);
  const firstLoadRef = useRef(true);
  const previousPendingIdsRef = useRef(new Set());

  const kotRef = useRef(null);
  const billRef = useRef(null);

  const createAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(SOUND_PATH);
      audioRef.current.loop = true;
    }

    return audioRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const audio = createAudio();

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {
        console.log("Sound blocked. Click once on page first.");
      });
  }, [createAudio]);

  const showDemoOrder = useCallback(() => {
    setNewOrder({
      ...demoOrder,
      id: Date.now(),
      created_at: new Date().toISOString(),
    });

    setShowModal(true);
    playSound();
  }, []);

  const playSound = useCallback(() => {
    if (isRingingRef.current) return;

    const audio = createAudio();
    isRingingRef.current = true;

    audio.play().catch(() => {
      isRingingRef.current = false;
      console.log("Sound blocked. Click once on page first.");
    });
  }, [createAudio]);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    isRingingRef.current = false;
  }, []);

  const fetchOnlineOrders = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/aggregator-orders/?restaurant_id=abc`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Unable to fetch online orders");
      }

      const data = await res.json();
      const orders = normalizeOrdersResponse(data);
      const pendingOrders = orders.filter((order) => order.status === "pending");

      const currentPendingIds = new Set(pendingOrders.map((order) => order.id));

      if (firstLoadRef.current) {
        previousPendingIdsRef.current = currentPendingIds;
        firstLoadRef.current = false;
        return;
      }

      const latestNewOrder = pendingOrders.find(
        (order) => !previousPendingIdsRef.current.has(order.id)
      );

      if (latestNewOrder) {
        setNewOrder(latestNewOrder);
        setShowModal(true);
        playSound();
      }

      previousPendingIdsRef.current = currentPendingIds;
    } catch (error) {
      console.log(error);

      // Demo testing only
      if (firstLoadRef.current) {
        previousPendingIdsRef.current = new Set();
        firstLoadRef.current = false;
        return;
      }

      // Remove this block when backend is ready
      // setNewOrder(demoOrder);
      // setShowModal(true);
      // playSound();
    }
  }, [playSound]);

  const updateOrderStatus = async (order, nextStatus, preparationTime = null) => {
    try {
      const url = `${API_BASE_URL}/aggregator-orders/${order.id}/status/`;

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          source: order.source,
          external_order_id: order.external_order_id,
          preparation_time: preparationTime,
        }),
      });
    } catch (error) {
      console.log("Status update failed, local testing mode", error);
    }
  };

  const printRef = async (ref, type = "kot") => {
    if (!ref?.current) return;

    const html = `
      <div class="print-template">
        ${ref.current.innerHTML}
      </div>
    `;

    if (window.electronAPI) {
      if (type === "kot") {
        await window.electronAPI.printKot(html);
      } else {
        await window.electronAPI.printBill(html);
      }

      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }

            html, body {
              width: 58mm;
              margin: 0;
              padding: 0;
              font-family: Arial;
              font-size: 11px;
            }

            .print-template {
              width: 58mm;
              max-width: 58mm;
              padding: 2mm;
            }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleAcceptOrder = async () => {
    if (!newOrder) return;

    stopSound();
    setPrintOrder(newOrder);

    setTimeout(async () => {
      await printRef(kotRef, "kot");

      setTimeout(async () => {
        await printRef(billRef, "bill");

        await updateOrderStatus(newOrder, "accepted", prepTime);

        setShowModal(false);
        setNewOrder(null);
        setPrintOrder(null);
      }, 500);
    }, 100);
  };

  const handleRejectOrder = async () => {
    if (!newOrder) return;

    stopSound();

    await updateOrderStatus(newOrder, "cancelled");

    setShowModal(false);
    setNewOrder(null);
    setPrintOrder(null);
  };

  useEffect(() => {
    fetchOnlineOrders();

    const interval = setInterval(() => {
      fetchOnlineOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOnlineOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      showDemoOrder();
    }, 1500);

    return () => clearTimeout(timer);
  }, [showDemoOrder]);

  useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      window.removeEventListener("click", handleFirstClick);
    };

    window.addEventListener("click", handleFirstClick);

    return () => {
      window.removeEventListener("click", handleFirstClick);
    };
  }, [unlockAudio]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  if (!showModal || !newOrder) {
    return (
      <>
        {printOrder && (
          <HiddenPrintTemplates
            printOrder={printOrder}
            kotRef={kotRef}
            billRef={billRef}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="global-order-overlay">
        <div className="global-order-modal">
          <button
            className="global-order-close"
            onClick={() => {
              stopSound();
              setShowModal(false);
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div className="global-order-top">
            <div className="global-order-icon">
              <i className="bi bi-bag-check-fill"></i>
            </div>

            <div>
              <h3>New Online Order</h3>
              <p>
                <span className={`platform-badge ${newOrder.source}`}>
                  {newOrder.source?.toUpperCase()}
                </span>
                <span className="order-id">
                  #{newOrder.external_order_id || newOrder.id}
                </span>
              </p>
            </div>
          </div>

          <div className="global-order-customer">
            <div className="customer-avatar">
              {(newOrder.customer_name || "CU").slice(0, 2).toUpperCase()}
            </div>

            <div>
              <h4>{newOrder.customer_name || "Customer"}</h4>
              <p>
                <i className="bi bi-telephone-fill"></i>
                {newOrder.customer_phone || "-"}
              </p>
            </div>

            <div className="total-box">
              <small>Total</small>
              <strong>₹{Number(newOrder.total_amount || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="global-order-address">
            <i className="bi bi-geo-alt-fill"></i>
            <span>{newOrder.address || newOrder.customer_address || "-"}</span>
          </div>

          <div className="global-order-items">
            <div className="section-title">Order Items</div>

            {getOrderItems(newOrder).map((item, index) => (
              <div className="global-order-item" key={item.id || index}>
                <div>
                  <b>{item.quantity || 1}× {item.name}</b>

                  {item.variant_name && (
                    <p>Variant: {item.variant_name}</p>
                  )}

                  {item.addons?.length > 0 && (
                    <p>+ {item.addons.map((a) => a.name || a).join(", ")}</p>
                  )}

                  {item.note && <p>Note: {item.note}</p>}
                </div>

                <strong>
                  ₹{Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          {newOrder.note && (
            <div className="global-order-note">
              <i className="bi bi-chat-left-text-fill"></i>
              {newOrder.note}
            </div>
          )}

          <div className="prep-time-section">
            <label>Preparation Time</label>

            <div className="prep-time-control">
              <button onClick={() => setPrepTime((prev) => Math.max(1, prev - 1))}>
                <i className="bi bi-dash-lg"></i>
              </button>

              <div>
                <strong>{prepTime}</strong>
                <span>min</span>
              </div>

              <button onClick={() => setPrepTime((prev) => prev + 1)}>
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>

          <div className="global-order-actions">
            <button className="reject-btn" onClick={handleRejectOrder}>
              <i className="bi bi-x-circle"></i>
              Reject
            </button>

            <button className="accept-btn" onClick={handleAcceptOrder}>
              <i className="bi bi-check-circle"></i>
              Accept & Print
            </button>
          </div>
        </div>
      </div>

      <HiddenPrintTemplates
        printOrder={printOrder || newOrder}
        kotRef={kotRef}
        billRef={billRef}
      />
    </>
  );
};

const HiddenPrintTemplates = ({ printOrder, kotRef, billRef }) => {
  if (!printOrder) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div ref={kotRef}>
        <PrintTemplate
          type="kot"
          items={getOrderItems(printOrder)}
          tableNumber={printOrder.table_number || "-"}
          orderType={printOrder.order_type}
          itemCount={getOrderItems(printOrder).length}
          orderNotes={printOrder.order_notes || printOrder.note || ""}
          customerName={printOrder.customer_name}
          customerPhone={printOrder.customer_phone}
          riderName={getRiderName(printOrder)}
          riderPhone={getRiderPhone(printOrder)}
          riderAssigned={isRiderAssigned(printOrder)}
        />
      </div>

      <div ref={billRef}>
        <PrintTemplate
          type="bill"
          items={getOrderItems(printOrder)}
          tableNumber={printOrder.table_number || "-"}
          orderType={printOrder.order_type}
          itemCount={getOrderItems(printOrder).length}
          orderNotes={printOrder.order_notes || printOrder.note || ""}
          customerName={printOrder.customer_name}
          customerPhone={printOrder.customer_phone}
          subtotal={printOrder.subtotal}
          taxAmount={printOrder.tax_amount}
          totalAmount={printOrder.total_amount}
          riderName={getRiderName(printOrder)}
          riderPhone={getRiderPhone(printOrder)}
          riderAssigned={isRiderAssigned(printOrder)}
        />
      </div>
    </div>
  );
};

export default GlobalOnlineOrderModal;