import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Table.css";
import { useSelector, useDispatch } from "react-redux";
import {
  loadTablesFromApi,
  loadTableOrders,
} from "../../../features/table/tableSlice";
import { orderStatus } from "../../../features/table/tableApi";
import OrderDetails from "../../../pages/orderHistory/components/OrderDetails";
import { fetchOrderHistory,viewOrderDetails } from "../../../features/orders/ordersSlice";
import toast from 'react-hot-toast';

const Table = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [selectedTable, setSelectedTable] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const printRef = useRef();
  const resturentName = useSelector((res) => res.menu.restaurant_name);
  const tables = useSelector((state) => state.tables.list);
  const loading = useSelector((state) => state.tables.loading);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState({});
  const [filterType, setFilterType] = useState("dinein");


  useEffect(() => {
    if (location.state?.orderType) {
      setFilterType(location.state.orderType);
    }
  }, [location.state]);

useEffect(() => {
    dispatch(fetchOrderHistory());
  }, [dispatch]);

  // useEffect(() => {
  //   const loadData = async () => {
  //     // const result = await dispatch(loadTablesFromApi()).unwrap();

  //     // Store loaded order IDs to prevent reloading
  //     const loadedOrderIds = new Set();

  //     result.forEach((table) => {
  //       if (
  //         table.status === "occupied" ||
  //         table.status === "confirmed" ||
  //         table.status === "preparing" ||
  //         table.status === "ready"
  //       ) {
  //         // Only load if not already loaded
  //         if (!loadedOrderIds.has(table.id)) {
  //           loadedOrderIds.add(table.id);
  //           dispatch(loadTableOrders(table.id));
  //         }
  //       }
  //     });
  //   };

  //   loadData();
  // }, [dispatch]);

  const allOrders = tables;



  const filteredTables = useMemo(() => {


    if (filterType === "dinein") {
      return allOrders.filter(table =>
        !table.order_type ||
        table.order_type === "dine_in" ||
        table.type === "dine_in"
      );
    } else if (filterType === "takeaway") {
      return allOrders.filter(table =>
        table.order_type === "takeaway" ||
        table.type === "takeaway"
      );
    } else if (filterType === "delivery") {
      return allOrders.filter(table =>
        table.order_type === "delivery" ||
        table.type === "delivery"
      );
    }
    return allOrders;
  }, [allOrders, filterType]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      delivered: "delivered",
      "on the way": "on-the-way",
      cancelled: "cancelled",
      pending: "pending",
      preparing: "preparing",
      ready: "ready",
      confirmed: "confirmed",
      occupied: "occupied",
      out_for_delivery: "out-for-delivery",
      completed: "completed",
    };
    return (
      statusMap[status?.toLowerCase()] ||
      status?.toLowerCase().replace(" ", "-")
    );
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getOrderTypeIcons = (type) => {
    switch (type?.toLowerCase()) {
      case "dine_in":
      case "dinein":
        return <i className="bi bi-cup-hot-fill"></i>;
      case "delivery":
        return <i className="bi bi-truck"></i>;
      case "takeaway":
        return <i className="bi bi-bag-check-fill"></i>;
      default:
        return <i className="bi bi-box"></i>;
    }
  };

  const getOrderTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case "dine_in":
      case "dinein":
        return "Dine-In";
      case "delivery":
        return "Delivery";
      case "takeaway":
        return "Takeaway";
      default:
        return type || "Order";
    }
  };

  // ✅ FIXED: Get action button text based on order status, not table status
  const getActionButtonText = (orderStatus, orderType) => {
    const statusLower = orderStatus?.toLowerCase();
    const orderTypeLower = orderType?.toLowerCase();

    const statusMap = {
      // Dine-in flow
      confirmed: { text: "Start", icon: "bi-play-circle" },
      occupied: { text: "Start", icon: "bi-play-circle" },
      preparing: { text: "Ready", icon: "bi-check2-circle" },
      ready: { text: "Completed", icon: "bi-check2-all" },

      // Takeaway flow
      confirmed_takeaway: { text: "Start", icon: "bi-play-circle" },
      preparing_takeaway: { text: "Ready", icon: "bi-bag-check" },
      ready_takeaway: { text: "Completed", icon: "bi-check2-circle" },

      // Delivery flow
      confirmed_delivery: { text: "Start", icon: "bi-play-circle" },
      preparing_delivery: { text: "Ready for Dispatch", icon: "bi-truck" },
      ready_delivery: { text: "Out for Delivery", icon: "bi-truck" },
      out_for_delivery: { text: "Mark Delivered", icon: "bi-check2-circle" },
    };

    // Create composite key for special flows
    if (orderTypeLower === "takeaway" || orderTypeLower === "delivery") {
      const compositeKey = `${statusLower}_${orderTypeLower}`;
      if (statusMap[compositeKey]) {
        return statusMap[compositeKey];
      }
    }

    // Return default status mapping
    return statusMap[statusLower] || { text: "Update Status", icon: "bi-arrow-right-circle" };
  };

  // Calculate table statistics
  const tableStats = useMemo(() => {
    const stats = {
      total: filteredTables.length,
      available: filteredTables.filter(t => t.status === "available").length,
      occupied: filteredTables.filter(t => t.status === "occupied" || t.status === "confirmed" || t.status === "preparing" || t.status === "ready").length,
      billing: filteredTables.filter(t => t.status === "billing").length,
      completed: filteredTables.filter(t => t.status === "completed" || t.status === "delivered").length,
      totalRevenue: filteredTables.reduce((sum, table) => sum + (parseFloat(table.amount) || parseFloat(table.order_total) || 0), 0),
    };
    return stats;
  }, [filteredTables]);


  const openTable = async (table) => {
    if (
      table.status === "occupied" ||
      table.status === "confirmed" ||
      table.status === "preparing" ||
      table.status === "ready"
    ) {
      await dispatch(loadTableOrders(table.id));
    }

    let orderType = "dine_in";

    if (table.order_type === "takeaway" || table.type === "takeaway") {
      orderType = "takeaway";
    } else if (table.order_type === "delivery" || table.type === "delivery") {
      orderType = "delivery";
    }

    navigate("/menu-item", {
      state: {
        table,
        tableId: table.id,
        tableNumber: table.tableNumber,
        orderType: orderType,
      },
    });
  };
  const viewOrder = async (table, e) => {
    e.stopPropagation();
    try {
      // If it's a local order (doesn't have API ID), show basic details
      if (!table.id || typeof table.id === 'string' && table.id.startsWith('temp')) {
        setSelectedOrder(table);
        setShowDetails(true);
        return;
      }

      const response = await dispatch(loadTableOrders(table.id)).unwrap();
      if (response.results && response.results.length > 0) {
        const latestOrder = response.results[0];
        const resultAction = await dispatch(viewOrderDetails(latestOrder.id));
        if (viewOrderDetails.fulfilled.match(resultAction)) {
          const orderData = resultAction.payload.order || resultAction.payload;
          setSelectedOrder(orderData);
          setShowDetails(true);
        }
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      toast.error("Failed to load order details");
    }
  };

  const startOrder = async (table, e) => {
    e.stopPropagation();

    // Set loading state
    setUpdatingOrderId(table.id);

    try {
      let orderId;
      let currentStatus;
      let orderType;

      if (table.isVirtualTable) {
        orderId = table.id;
        currentStatus = table.order_status?.toLowerCase();
        orderType = table.order_type || table.type || "takeaway";
      } else {
        const res = await dispatch(loadTableOrders(table.id)).unwrap();

        if (!res.results?.length) {
          console.warn("No orders found for this table");
          toast.error("No orders found for this table");
          return;
        }

        const latestOrder = res.results[0];
        orderId = latestOrder.id;
        currentStatus = latestOrder.status?.toLowerCase();
        orderType = table.order_type || table.type || "dine_in";
      }

      let nextStatus = null;

      if (orderType === "dine_in" || orderType === "dinein") {
        const dineInFlow = {
          confirmed: "preparing",
          occupied: "preparing",
          preparing: "ready",
          ready: "completed",
        };
        nextStatus = dineInFlow[currentStatus];
      }
      else if (orderType === "takeaway") {
        const takeawayFlow = {
          confirmed: "preparing",
          preparing: "ready",
          ready: "completed",
        };
        nextStatus = takeawayFlow[currentStatus];
      }
      else if (orderType === "delivery") {
        const deliveryFlow = {
          confirmed: "preparing",
          preparing: "ready",
          ready: "completed",
          // out_for_delivery: "delivered",
        };
        nextStatus = deliveryFlow[currentStatus];
      }

      if (!nextStatus) {
        console.warn(`No status transition defined for: ${currentStatus} with order type: ${orderType}`);
        toast.error(`Cannot update status from ${currentStatus}`);
        return;
      }

      if (nextStatus === currentStatus) {
        console.log("Order already in final state");
        toast.success(`Order is already ${currentStatus}`);
        return;
      }

      // console.log(`Updating order ${orderId} from ${currentStatus} to ${nextStatus}`);

      const result = await orderStatus.updateOrderStatus(orderId, {
        status: nextStatus,
      });

      if (result) {
        // console.log("Order status updated successfully:", result);

        await dispatch(loadTablesFromApi());

        toast.success(`Order status updated to ${nextStatus} successfully!`);
      }

    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };



  const printBill = async (table, e) => {
    e.stopPropagation();

    try {
      const response = await dispatch(loadTableOrders(table.id)).unwrap();

      if (response.results && response.results.length > 0) {
        const latestOrder = response.results[0];

        const resultAction = await dispatch(viewOrderDetails(latestOrder.id));

        if (viewOrderDetails.fulfilled.match(resultAction)) {
          const orderData = resultAction.payload.order || resultAction.payload;

          setSelectedOrder(orderData);

          setTimeout(() => {
            window.print();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print bill");
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return {
          color: "available",
          icon: "bi-check-circle-fill",
          label: "AVAILABLE",
          bgClass: "available-bg",
          textClass: "available-text"
        };
      case "occupied":
      case "confirmed":
        return {
          color: "occupied",
          icon: "bi-people-fill",
          label: status === "confirmed" ? "CONFIRMED" : "OCCUPIED",
          bgClass: "occupied-bg",
          textClass: "occupied-text"
        };
      case "preparing":
        return {
          color: "preparing",
          icon: "bi-gear-fill",
          label: "PREPARING",
          bgClass: "preparing-bg",
          textClass: "preparing-text"
        };
      case "ready":
        return {
          color: "ready",
          icon: "bi-check-circle-fill",
          label: "READY",
          bgClass: "ready-bg",
          textClass: "ready-text"
        };
      case "out_for_delivery":
        return {
          color: "out-for-delivery",
          icon: "bi-truck",
          label: "OUT FOR DELIVERY",
          bgClass: "delivery-bg",
          textClass: "delivery-text"
        };
      case "delivered":
      case "completed":
        return {
          color: "completed",
          icon: "bi-check2-all",
          label: status === "delivered" ? "DELIVERED" : "COMPLETED",
          bgClass: "completed-bg",
          textClass: "completed-text"
        };
      case "billing":
        return {
          color: "billing",
          icon: "bi-receipt",
          label: "BILLING",
          bgClass: "billing-bg",
          textClass: "billing-text"
        };
      default:
        return {
          color: "secondary",
          icon: "bi-question-circle",
          label: status?.toUpperCase() || "UNKNOWN",
          bgClass: "secondary-bg",
          textClass: "secondary-text"
        };
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="table-management-container">
        <div className="loading-container">
          <div className="custom-spinner"></div>
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-management-container">
      <div className="table-wrapper">
        {/* Header Section */}
        <div className="table-header">
          <div className="header-title">
            <i className="bi bi-grid-3x3-gap-fill"></i>
            <h2>Order Management</h2>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-table"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Showing:</span>
                <span className="stat-value">{filteredTables.length} Orders</span>
              </div>
            </div>
            <div className="stat-card available">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Available:</span>
                <span className="stat-value">{tableStats.available}</span>
              </div>
            </div>
            <div className="stat-card occupied">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Active:</span>
                <span className="stat-value">{tableStats.occupied}</span>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">
                <i className="bi bi-check2-all"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{tableStats.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "dinein" ? "active" : ""}`}
              onClick={() => setFilterType("dinein")}
            >
              <i className="bi bi-cup-hot-fill"></i>
              <span>Dine-In</span>
              <span className="badge">
                {allOrders.filter(t => !t.order_type || t.order_type === "dine_in" || t.type === "dine_in").length}
              </span>
            </button>
            <button
              className={`filter-btn ${filterType === "takeaway" ? "active" : ""}`}
              onClick={() => setFilterType("takeaway")}
            >
              <i className="bi bi-bag-check-fill"></i>
              <span>Takeaway</span>
              <span className="badge">
                {allOrders.filter(t => t.order_type === "takeaway" || t.type === "takeaway").length}
              </span>
            </button>
            <button
              className={`filter-btn ${filterType === "delivery" ? "active" : ""}`}
              onClick={() => setFilterType("delivery")}
            >
              <i className="bi bi-truck"></i>
              <span>Delivery</span>
              <span className="badge">
                {allOrders.filter(t => t.order_type === "delivery" || t.type === "delivery").length}
              </span>
            </button>
          </div>
        </div>

        {/* Tables/Orders Grid */}
        {filteredTables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-inbox"></i>
            </div>
            <h4>No {filterType === "dinein" ? "Dine-In" : filterType === "takeaway" ? "Takeaway" : "Delivery"} Orders</h4>
            <p>
              {filterType === "dinein"
                ? "Start by adding a dine-in order"
                : filterType === "takeaway"
                  ? "Takeaway orders will appear here"
                  : "Delivery orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="tables-grid">
            {filteredTables.map((table) => {
              const orderDetails = table.orderDetails || table.order_details || {};
              const currentStatus = table.order_status || orderDetails.status || table.status || "confirmed";
              const status = getStatusConfig(currentStatus);
              const orderType = table.order_type || table.type || "dine_in";
              const amount = table.amount || table.order_total || table.total || 0;
              const tableNumber = table.table_number || table.table_number;
              const customerName = table.customer_name || "Guest";
              const customerPhone = table.customer_phone;

              // Get orderDetails from the table object
              const items = table?.orderDetails?.items ||
                table?.order_details?.items ||
                table?.items ||
                [];

              const orderTime = table.createdAt || orderDetails.created_at
                ? new Date(table.createdAt || orderDetails.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : '12:46';

              const itemCount = items.length || 1;

              const actionButton = getActionButtonText(
                table.order_status || orderDetails.status || table.status,
                orderType
              );

              return (
                <div
                  key={table.id || Math.random()}
                  className={`table-card ${status.color} ${orderType} takeaway-card`}
                  onClick={() => openTable(table)}
                >
                  {/* Takeaway Card Layout for ALL orders */}
                  <>
                    <div className="takeaway-header">
                      <div className="order-type-badge">
                        <i className={`bi ${
                          orderType === "dine_in" || orderType === "dinein" 
                            ? 'bi-cup-hot-fill' 
                            : orderType === "delivery" 
                              ? 'bi-truck' 
                              : 'bi-bag-check-fill'
                        }`}></i>
                        <span>{getOrderTypeLabel(orderType)}</span>
                      </div>
                      <div className="order-time">{orderTime}</div>
                    </div>

                    <div className="customer-section">
                      <div className="customer-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="customer-details">
                        <h3 className="customer-name">
                          {orderType === "dine_in" || orderType === "dinein" 
                            ? `Table ${tableNumber} - ${customerName}`
                            : customerName
                          }
                        </h3>
                        {customerPhone && <span className="customer-phone">{customerPhone}</span>}
                      </div>
                    </div>

                    <div className="order-items">
                      <div className="items-header">
                        <span className="item-count">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                        <span className="item-price">{formatCurrency(amount)}</span>
                      </div>

                      {/* Display all items */}
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <div key={item.id || index} className="item-container">
                            {/* Main Item */}
                            <div className="item-details main-item">
                              <div className="item-info">
                                <span className="item-name">{item.menu_item_name}</span>
                                {item.variant_selections && item.variant_selections.length > 0 && (
                                  <span className="item-variant">
                                    ● {item.variant_selections[0].variant_name}
                                  </span>
                                )}
                              </div>
                              <div className="item-right">
                                {item.quantity > 1 && (
                                  <span className="item-qty">x{item.quantity}</span>
                                )}
                                <span className="item-price-small">
                                  {formatCurrency(item.total_price)}
                                </span>
                              </div>
                            </div>

                            {/* Addons for this item */}
                            {item.addon_selections && item.addon_selections.length > 0 && (
                              <div className="item-addons">
                                {item.addon_selections.map((addon, idx) => (
                                  <div key={addon.id || idx} className="addon-item">
                                    <span>+ {addon.addon_name}</span>
                                    <span className="addon-price">{formatCurrency(addon.addon_price)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="item-details">
                          <span className="item-name">Order #{table.order_number || table.id}</span>
                        </div>
                      )}
                    </div>

                    <div className="order-status-section">
                      <div className="status-text">
                        <span className="status-label">
                          {currentStatus === 'confirmed' && '⏳ Waiting to Start'}
                          {currentStatus === 'preparing' && '⚙ Preparing'}
                          {currentStatus === 'ready' && '✅ Ready'}
                          {currentStatus === 'completed' && '✓ Completed'}
                          {currentStatus === 'delivered' && '✓ Delivered'}
                          {currentStatus === 'occupied' && '👥 Occupied'}
                        </span>
                        <span className="eta">
                          {orderType === "dine_in" || orderType === "dinein" 
                            ? `Table: ${tableNumber}` 
                            : `ETA: ${orderTime}`
                          }
                        </span>
                      </div>

                      <div className="progress-steps">
                        <div className={`step ${currentStatus === 'confirmed' || currentStatus === 'occupied' || currentStatus === 'preparing' || currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'delivered' ? 'active' : ''} ${currentStatus === 'preparing' || currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'delivered' ? 'completed' : ''}`}>
                          <span className="step-dot"></span>
                          <span className="step-label">Ordered</span>
                        </div>
                        <div className={`step ${currentStatus === 'preparing' || currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'delivered' ? 'active' : ''} ${currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'delivered' ? 'completed' : ''}`}>
                          <span className="step-dot"></span>
                          <span className="step-label">Preparing</span>
                        </div>
                        <div className={`step ${currentStatus === 'ready' || currentStatus === 'completed' || currentStatus === 'delivered' ? 'active' : ''} ${currentStatus === 'completed' || currentStatus === 'delivered' ? 'completed' : ''}`}>
                          <span className="step-dot"></span>
                          <span className="step-label">Ready</span>
                        </div>
                      </div>
                    </div>

                    <div className="takeaway-actions">
                      {(currentStatus !== "completed" && currentStatus !== "delivered") && (
                        <>
                          <button
                            className="action-btn start"
                            onClick={(e) => startOrder(table, e)}
                            disabled={updatingOrderId === table.id}
                          >
                            {updatingOrderId === table.id ? (
                              <i className="bi bi-arrow-repeat spin"></i>
                            ) : (
                              <>
                                <i className={`bi ${actionButton.icon}`}></i>
                                <span>{actionButton.text}</span>
                              </>
                            )}
                          </button>
                          {/* <button className="action-btn view" onClick={(e) => viewOrder(table, e)}>
                            <i className="bi bi-eye"></i>
                            <span>View</span>
                          </button> */}
                          <button className="action-btn bill" onClick={(e) => printBill(table, e)}>
                            <i className="bi bi-receipt"></i>
                            <span>Bill</span>
                          </button>
                        </>
                      )}
                      
                      {(currentStatus === "completed" || currentStatus === "delivered") && (
                        <>
                          {/* <button className="action-btn view" onClick={(e) => viewOrder(table, e)}>
                            <i className="bi bi-eye"></i>
                            <span>View</span>
                          </button> */}
                          <button className="action-btn bill" onClick={(e) => printBill(table, e)}>
                            <i className="bi bi-receipt"></i>
                            <span>Bill</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {/* {showDetails && selectedOrder && (
        <OrderDetails
          selectedOrder={selectedOrder}
          onClose={() => setShowDetails(false)}
          formatDate={formatDate}
          getStatusClass={getStatusClass}
          getOrderTypeIcon={getOrderTypeIcons}
          formatCurrency={formatCurrency}
        />
      )} */}

      {/* Print Section */}
      {selectedOrder && (
        <div className="print-section">
          <div className="bill-print">

            <h3 className="center">{resturentName}</h3>

            <div className="divider"></div>

            <div className="bill-row">
              <span>Order #</span>
              <span>{selectedOrder.id}</span>
            </div>

            <div className="bill-row">
              <span>Customer</span>
              <span>{selectedOrder.customer_name}</span>
            </div>

            <div className="bill-row">
              <span>Phone</span>
              <span>{selectedOrder.customer_phone}</span>
            </div>

            <div className="bill-row">
              <span>Table</span>
              <span>{selectedOrder.table_number}</span>
            </div>

            <div className="divider"></div>

            <table className="bill-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                {selectedOrder.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.menu_item_name}</td>
                    <td>x{item.quantity}</td>
                    <td>₹{item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider"></div>
            <div className="total-row">
              <span>Sub Total</span>
              <span>₹{selectedOrder.subtotal}</span>
            </div>
            <div className="total-row">
              <span>GST %</span>
              <span>₹{selectedOrder.tax_amount}</span>
            </div>
            <div className="total-row">
              <span>Total</span>
              <span>₹{selectedOrder.total_amount}</span>
            </div>


            <div className="divider"></div>

            <p className="d-flex justify-content-center thank-you">
              Thank you! Visit Again 🙏
            </p>

          </div>
        </div>
      )}
    </div>
  );
};

export default Table;