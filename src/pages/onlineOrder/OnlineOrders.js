import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PrintTemplate from "../../components/PrintTemplate";
import "./OnlineOrders.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SOUND_PATH = "sounds/online-order.mp3"


const ORDER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "cancelled", label: "Cancelled" },
];

const SOURCE_LABEL = {
  zomato: "Zomato",
  swiggy: "Swiggy",
  directapp: "Direct App",
  direct: "Direct App",
  pos: "Direct App",
};

const SOURCE_CLASS = {
  zomato: "source-zomato",
  swiggy: "source-swiggy",
  directapp: "source-directapp",
  direct: "source-directapp",
  pos: "source-directapp",
};

const demoOrders = [
  {
    id: 1,
    source: "zomato",
    external_order_id: "ZOM-10245",
    status: "pending",
    customer_name: "Rahul Sharma",
    customer_phone: "9876543210",
    order_type: "delivery",
    payment_method: "online",
    created_at: new Date().toISOString(),
    accepted_at: null,
    delivered_at: null,
    subtotal: 499.0,
    tax_amount: 24.95,
    total_amount: 523.95,
    address: "Sector 45, Gurgaon",
    note: "Please add tissue",
    items: [
      {
        id: 101,
        name: "Paneer Pizza",
        quantity: 1,
        price: 299.0,
        item_total: 299.0,
        variant_name: "Large",
        addons: [
          {
            name: "Extra Cheese",
            price: 40,
          },
          {
            name: "Olives",
            price: 20,
          },
        ],
        note: "Extra spicy",
      },

      {
        id: 102,
        name: "Cold Coffee",
        quantity: 2,
        price: 100.0,
        item_total: 200.0,
        variant_name: "",
        addons: [],
        note: "",
      },
    ],
  },
  {
    id: 2,
    source: "swiggy",
    external_order_id: "ZOM-10245",
    status: "pending",
    customer_name: "Rahul Sharma",
    customer_phone: "9876543210",
    order_type: "delivery",
    payment_method: "online",
    created_at: new Date().toISOString(),
    accepted_at: null,
    delivered_at: null,
    subtotal: 499.0,
    tax_amount: 24.95,
    total_amount: 523.95,
    address: "Sector 45, Gurgaon",
    note: "Please add tissue",
    items: [
      {
        id: 101,
        name: "Paneer Pizza",
        quantity: 1,
        price: 299.0,
        item_total: 299.0,
        variant_name: "Large",
        addons: [
          {
            name: "Extra Cheese",
            price: 40,
          },
          {
            name: "Olives",
            price: 20,
          },
        ],
        note: "Extra spicy",
      },

      {
        id: 102,
        name: "Cold Coffee",
        quantity: 2,
        price: 100.0,
        item_total: 200.0,
        variant_name: "",
        addons: [],
        note: "",
      },
    ],
  },
  {
    id: 3,
    source: "swiggy",
    external_order_id: "ZOM-10245",
    status: "pending",
    customer_name: "Rahul Sharma",
    customer_phone: "9876543210",
    order_type: "delivery",
    payment_method: "online",
    created_at: new Date().toISOString(),
    accepted_at: null,
    delivered_at: null,
    subtotal: 499.0,
    tax_amount: 24.95,
    total_amount: 523.95,
    address: "Sector 45, Gurgaon",
    note: "Please add tissue",
    items: [
      {
        id: 101,
        name: "Paneer Pizza",
        quantity: 1,
        price: 299.0,
        item_total: 299.0,
        variant_name: "Large",
        addons: [
          {
            name: "Extra Cheese",
            price: 40,
          },
          {
            name: "Olives",
            price: 20,
          },
        ],
        note: "Extra spicy",
      },

      {
        id: 102,
        name: "Cold Coffee",
        quantity: 2,
        price: 100.0,
        item_total: 200.0,
        variant_name: "",
        addons: [],
        note: "",
      },
    ],
  },
  {
    id: 4,
    source: "swiggy",
    external_order_id: "SWG-88221",
    status: "accepted",
    customer_name: "Amit Kumar",
    customer_phone: "9999999999",
    order_type: "delivery",
    payment_method: "cod",
    created_at: new Date().toISOString(),
    accepted_at: new Date().toISOString(),
    subtotal: 260.0,
    tax_amount: 13.0,
    total_amount: 273.0,
    address: "DLF Phase 3, Gurgaon",
    note: "Please add extra sauce",
    items: [
      {
        id: 201,
        name: "Veg Burger",
        quantity: 2,
        price: 130.0,
        item_total: 260.0,
        variant_name: "",
        addons: [
          {
            name: "Cheese Slice",
            price: 20,
          },
        ],
        note: "Less spicy",
      },
    ],
  },
  {
    id: 5,
    source: "zomato",
    external_order_id: "ZOM-10245",
    status: "pending",
    customer_name: "Rahul Sharma",
    customer_phone: "9876543210",
    order_type: "delivery",
    payment_method: "online",
    created_at: new Date().toISOString(),
    accepted_at: null,
    delivered_at: null,
    subtotal: 499.0,
    tax_amount: 24.95,
    total_amount: 523.95,
    address: "Sector 45, Gurgaon",
    note: "Please add tissue",
    items: [
      {
        id: 101,
        name: "Paneer Pizza",
        quantity: 1,
        price: 299.0,
        item_total: 299.0,
        variant_name: "Large",
        addons: [
          {
            name: "Extra Cheese",
            price: 40,
          },
          {
            name: "Olives",
            price: 20,
          },
        ],
        note: "Extra spicy",
      },

      {
        id: 102,
        name: "Cold Coffee",
        quantity: 2,
        price: 100.0,
        item_total: 200.0,
        variant_name: "",
        addons: [],
        note: "",
      },
    ],
  },
];


const formatPrice = (value) => `₹${Number(value || 0).toFixed(2)}`;

const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

const getSourceLabel = (source) => SOURCE_LABEL[source] || source || "POS";

const getSourceClass = (source) => SOURCE_CLASS[source] || "source-pos";

const getRiderName = (order) => order?.rider_name || order?.delivery_rider_name || order?.rider?.name || order?.delivery_partner?.name || "";

const getRiderPhone = (order) => order?.rider_phone || order?.delivery_rider_phone || order?.rider?.phone || order?.delivery_partner?.phone || "";

const isRiderAssigned = (order) => Boolean(getRiderName(order) || getRiderPhone(order) || order?.rider_id);

const normalizeOrdersResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
};

const OnlineOrders = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedAcceptOrder, setSelectedAcceptOrder] = useState(null);
  const [prepTime, setPrepTime] = useState(15);
  const [viewType, setViewType] = useState("columns");

  const audioRef = useRef(null);
  const isRingingRef = useRef(false);
  const firstLoadRef = useRef(true);
  const previousPendingIdsRef = useRef(new Set());
  const kotRef = useRef();
  const billRef = useRef();
  const [printOrder, setPrintOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const counts = useMemo(() => {
    return ORDER_TABS.reduce((acc, tab) => {
      if (tab.key === "all") {
        acc[tab.key] = orders.length;
      } else {
        acc[tab.key] = orders.filter(
          (order) => order.status === tab.key
        ).length;
      }

      return acc;
    }, {});
  }, [orders]);
  const platformStats = useMemo(() => {
    const platforms = ["zomato", "swiggy", "directapp"];

    return platforms.map((platform) => {
      const platformOrders = orders.filter(
        (order) => String(order.source).toLowerCase() === platform
      );

      const totalOrders = platformOrders.length;

      const activeOrders = platformOrders.filter(
        (order) =>
          order.status !== "cancelled" &&
          order.status !== "ready"
      ).length;

      const revenue = platformOrders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      return {
        key: platform,
        label: getSourceLabel(platform),
        revenue,
        totalOrders,
        activeOrders,
      };
    });
  }, [orders]);
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

  const playNewOrderSound = useCallback(() => {
    if (isRingingRef.current) return;

    const audio = createAudio();
    isRingingRef.current = true;

    audio.play().catch(() => {
      isRingingRef.current = false;
      console.log("Sound blocked. Click once on page first.");
    });
  }, [createAudio]);

  const stopNewOrderSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    isRingingRef.current = false;
  }, []);

  const SOURCE_CARD_CLASS = {
    zomato: "zomato-order",
    swiggy: "swiggy-order",
    directapp: "directapp-order",
    direct: "directapp-order",
    pos: "directapp-order",
  };

  const getSourceCardClass = (source) =>
    SOURCE_CARD_CLASS[String(source || "").toLowerCase()] || "directapp-order";

  const fetchOnlineOrders = useCallback(async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) setLoading(true);

      setError("");


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
      setOrders(normalizeOrdersResponse(data));
    } catch (err) {
      console.error(err);

      setOrders(demoOrders);
      setError("Showing demo orders. Connect backend API when ready.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const updateLocalOrderStatus = useCallback((orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        Number(order.id) === Number(orderId)
          ? { ...order, status: nextStatus }
          : order
      )
    );

    setSelectedOrder((prev) =>
      Number(prev?.id) === Number(orderId)
        ? { ...prev, status: nextStatus }
        : prev
    );
  }, []);

  const updateOrderStatus = useCallback(
    async (order, nextStatus, preparationTime = null) => {
      try {
        setActionLoadingId(order.id);

        if (order.status === "pending") {
          stopNewOrderSound();
        }

        const url = `${API_BASE_URL}/aggregator-orders/${order.id}/status/`;

        const res = await fetch(url, {
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

        if (!res.ok) {
          throw new Error("Status update failed");
        }

        updateLocalOrderStatus(order.id, nextStatus);
      } catch (err) {
        console.error(err);

        // Local update for testing/demo
        updateLocalOrderStatus(order.id, nextStatus);
      } finally {
        setActionLoadingId(null);
      }
    },
    [stopNewOrderSound, updateLocalOrderStatus]
  );

  const handleAcceptOrder = async () => {
    if (!selectedAcceptOrder) return;

    try {
      stopNewOrderSound();
      setPrintOrder(selectedAcceptOrder);

      setTimeout(async () => {
        await printRef(kotRef, "kot");

        setTimeout(async () => {
          await printRef(billRef, "bill");

          await updateOrderStatus(selectedAcceptOrder, "accepted", prepTime);

          setShowTimeModal(false);
          setSelectedAcceptOrder(null);
        }, 500);
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };


  const printRef = async (ref, type = "kot") => {
    if (!ref?.current) return;

    const html = `
    <div className="print-template">
      ${ref.current.innerHTML}
    </div>
  `;

    // Electron Print
    if (window.electronAPI) {
      if (type === "kot") {
        await window.electronAPI.printKot(html);
      } else {
        await window.electronAPI.printBill(html);
      }

      return;
    }

    // Web Print
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

      <body>
        ${html}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handlePrintKot = (order) => {
    setPrintOrder(order);

    setTimeout(() => {
      printRef(kotRef, "kot");
    }, 100);
  };

  const renderActions = useCallback(
    (order) => {
      const isLoading = Number(actionLoadingId) === Number(order.id);

      if (order.status === "pending") {
        return (
          <>
            <button
              className="oo-btn success"
              disabled={isLoading}
              onClick={() => {
                setSelectedAcceptOrder(order);
                setShowTimeModal(true);
              }}
            >
              ✓ Accept
            </button>

          </>
        );
      }

      if (order.status === "accepted") {
        return (
          <button
            className="oo-btn primary"
            disabled={isLoading}
            onClick={() => updateOrderStatus(order, "preparing")}
          >
            🔥 Start Preparing
          </button>
        );
      }

      if (order.status === "preparing") {
        return (
          <button
            className="oo-btn success"
            disabled={isLoading}
            onClick={() => updateOrderStatus(order, "ready")}
          >
            Mark Ready
          </button>
        );
      }

      return null;
    },
    [actionLoadingId, updateOrderStatus]
  );

  useEffect(() => {
    fetchOnlineOrders({ showLoader: true });
  }, [fetchOnlineOrders]);


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
    const pendingOrders = orders.filter((order) => order.status === "pending");
    const currentPendingIds = new Set(pendingOrders.map((order) => order.id));

    if (firstLoadRef.current) {
      previousPendingIdsRef.current = currentPendingIds;
      firstLoadRef.current = false;
      return;
    }

    const hasNewPendingOrder = pendingOrders.some(
      (order) => !previousPendingIdsRef.current.has(order.id)
    );

    if (hasNewPendingOrder) {
      playNewOrderSound();
    }

    if (pendingOrders.length === 0) {
      stopNewOrderSound();
    }

    previousPendingIdsRef.current = currentPendingIds;
  }, [orders, playNewOrderSound, stopNewOrderSound]);

  useEffect(() => {
    return () => {
      stopNewOrderSound();
    };
  }, [stopNewOrderSound]);

  return (
    <div className="online-orders-page">
      <div className="oo-header">
        <div>
          <div className="d-flex gap-2">
            <h2>Online Orders</h2>
            <span className="on-live-dot" id="on-live-dot"><span className="on-pulse"></span>Live</span></div>
          <p>Zomato / Swiggy orders dashboard</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="oo-tabs">
            {ORDER_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`oo-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                <span>{counts[tab.key] || 0}</span>
              </button>
            ))}
          </div>
          <button
            className="oo-refresh-btn"
            onClick={() => fetchOnlineOrders({ showLoader: true })}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-end view-toggle mb-2">
        <button
          className={viewType === "columns" ? "active" : ""}
          onClick={() => setViewType("columns")}
        >
          <i className="bi bi-list-columns-reverse"></i>
        </button>
        <button
          className={viewType === "grid" ? "active" : ""}
          onClick={() => setViewType("grid")}
        >
          <i className="bi bi-grid-fill"></i>
        </button>
      </div>
      <div className="on-plat-row" id="on-plat-row">
        {platformStats.map((platform) => (
          <div
            key={platform.key}
            className={`on-plat-card ${platform.key}`}
          >
            <div className="on-plat-logo">
              <span className={`zdot ${platform.key.charAt(0)}`}></span>
              {platform.label}
            </div>

            <div className="on-plat-rev">
              {formatPrice(platform.revenue)}
            </div>

            <div className="on-plat-nums">
              <div className="on-plat-num">
                <div className="on-plat-n">
                  {platform.totalOrders}
                </div>

                <div className="on-plat-l">Total</div>
              </div>

              <div className="on-plat-num">
                <div className="on-plat-n">
                  {platform.activeOrders}
                </div>

                <div className="on-plat-l">Active</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="oo-alert">{error}</div>}



      {loading ? (
        <div className="oo-empty">Loading online orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="oo-empty">
          <i className="bi bi-bag-check"></i>
          <h4>No orders found</h4>
          <p>No {activeTab} online orders right now.</p>
        </div>
      ) : (
        <div className={`oo-list ${viewType}`}>
          {filteredOrders.map((order) => {
            const items = getOrderItems(order);

            return (
              <div className={`oo-card-full  ${getSourceCardClass(order.source)}`} key={order.id}>
                <div className="oo-strip"></div>

                <div className="oo-header">
                  <div>
                    <span className={`oo-source ${getSourceClass(order.source)}`}>
                      {getSourceLabel(order.source)}
                    </span>

                    <span className="oo-order-no">
                      {order.external_order_id || `Order #${order.id}`}
                    </span>

                    <span className="oo-time">
                      <i className="bi bi-clock"></i>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </span>
                  </div>

                  <div className="oo-badges">
                    <span className="oo-just-now">Just now</span>
                    <span className="oo-new">NEW</span>
                  </div>
                </div>

                <div className="oo-customer-row">
                  <div className="oo-avatar">
                    {(order.customer_name || "NS").slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h4>{order.customer_name || "Customer"}</h4>
                    <p>
                      <i className="bi bi-telephone-fill"></i>
                      {order.customer_phone || "-"}
                    </p>
                  </div>

                  <div className="oo-eta">
                    <small>ETA</small>
                    <b>32 min</b>
                  </div>
                </div>

                <div className="oo-address">
                  <i className="bi bi-geo-alt"></i>
                  {order.customer_address || order.address || "-"}
                </div>

                <div className="oo-divider"></div>

                <div className="oo-items">
                  {items.map((item, index) => (
                    <div className="oo-item-line" key={item.id || index}>
                      <span>
                        {/* <span className="oo-food-icon">🍲</span> */}
                        {item.name}
                        {item.addons?.length > 0 && (
                          <div className="oo-item-addons">
                            + {item.addons.map((a) => a.name || a).join(", ")}
                          </div>
                        )}
                        {item.note && (
                          <div className="oo-item-note">
                            Note: {item.note}
                          </div>
                        )}
                      </span>


                      <b>
                        {item.quantity || 1}×
                        <strong>
                          {formatPrice(
                            Number(item.price || 0) * Number(item.quantity || 1)
                          )}
                        </strong>
                      </b>

                    </div>

                  ))}
                </div>

                {order.note && (
                  <div className="notes">
                    <div className="oo-order-note">
                      <span>Note : -{order.note}</span>
                    </div>
                  </div>
                )}

                <div className="oo-price-breakup">
                  <div>
                    <span>Subtotal</span>
                    <b>{formatPrice(order.subtotal || order.total_amount)}</b>
                  </div>

                  <div>
                    <span>Delivery charge</span>
                    <b>{formatPrice(order.delivery_charge || 0)}</b>
                  </div>
                  <div>
                    <span>Tax</span>
                    <b>{formatPrice(order.tax_amount || 0)}</b>
                  </div>
                </div>

                <div className="oo-total-row">
                  <span>Total</span>
                  <b>{formatPrice(order.total_amount)}</b>
                </div>

                <div className="oo-footer">
                  <div className="oo-actions-left">
                    {renderActions(order)}

                    {order.status === "pending" &&
                      <button
                        className="oo-btn kot"
                        onClick={() => handlePrintKot(order)}
                      >
                        🔥 Accept & KOT
                      </button>
                    }
                    {(order.status !== "preparing" ||
                      order.status !== "ready" ||
                      order.status !== "cancelled") && (
                        <button
                          className="oo-btn reject"
                          onClick={() => updateOrderStatus(order, "cancelled")}
                        >
                          × Reject
                        </button>
                      )}
                    {order.status === "ready" &&
                      <button
                        className="oo-btn dispatch"

                      >
                        🛵 Dispatch
                      </button>
                    }
                  </div>

                  <button className="oo-btn details">View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTimeModal && (
        <div className="prep-modal-overlay" onClick={() => setShowTimeModal(false)}>
          <div className="prep-modal" onClick={(e) => e.stopPropagation()}>
            <button className="prep-modal-close" onClick={() => setShowTimeModal(false)}>
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="prep-modal-icon">
              <i className="bi bi-clock-history"></i>
            </div>

            <h3>Accept Order</h3>
            <p className="prep-modal-subtitle">
              Set preparation time before accepting this order
            </p>

            <div className="prep-time-card">
              <button
                className="prep-step-btn"
                onClick={() => setPrepTime((prev) => Math.max(1, prev - 1))}
              >
                <i className="bi bi-dash-lg"></i>
              </button>

              <div className="prep-time-display">
                <strong>{prepTime}</strong>
                <span>Min</span>
              </div>

              <button
                className="prep-step-btn"
                onClick={() => setPrepTime((prev) => prev + 1)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>

            <div className="prep-modal-actions">
              <button
                className="prep-cancel-btn"
                onClick={() => setShowTimeModal(false)}
              >
                Cancel
              </button>

              <button className="prep-confirm-btn" onClick={handleAcceptOrder}>
                ✓  Accept Order
              </button>
            </div>
          </div>
        </div>
      )}

      {printOrder && (
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
              orderNotes={printOrder.order_notes || ""}
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
              orderNotes={printOrder.order_notes || ""}
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
      )}
    </div>
  );
};

export default OnlineOrders;