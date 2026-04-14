import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderHistory,viewOrderDetails } from "../../features/orders/ordersSlice";
import "./OrderHistory.css";
import OrderDetails from "./components/OrderDetails";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    orderType: "all",
    search: "",
  });

  // Get data from Redux store
  const { orders, loading, error } = useSelector((state) => state.orders);
  const user = useSelector((state) => state?.auth?.user?.user);
  const userRole = user?.user_type;

  useEffect(() => {
    dispatch(fetchOrderHistory());
  }, [dispatch]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      applyFilters();
    } else {
      setFilteredOrders([]);
    }
  }, [orders, filters]);

  const applyFilters = () => {
    let filtered = [...orders];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === filters.status.toLowerCase(),
      );
    }

    // Filter by order type
    if (filters.orderType !== "all") {
      filtered = filtered.filter(
        (order) => order.order_type === filters.orderType,
      );
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at || order.date);

        switch (filters.dateRange) {
          case "today":
            return orderDate >= today;
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDate >= yesterday && orderDate < today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case "month":
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1,
            );
            return orderDate >= monthStart;
          default:
            return true;
        }
      });
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchLower) ||
          order.customer_name?.toLowerCase().includes(searchLower) ||
          order.customer_phone?.includes(filters.search),
      );
    }

    // console.log("Filtered orders:", filtered);
    setFilteredOrders(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      orderType: "all",
      search: "",
    });
  };

  const handleViewDetails = async (order) => {
  try {
    const resultAction = await dispatch(viewOrderDetails(order.id));
    
    if (viewOrderDetails.fulfilled.match(resultAction)) {
      const orderData = resultAction.payload.order || resultAction.payload;
      setSelectedOrder(orderData);
      setShowDetails(true);
    } else {
      console.error("Failed to fetch order details");
      setSelectedOrder(order);
      setShowDetails(true);
    }
  } catch (err) {
    console.error(err);
    setSelectedOrder(order);
    setShowDetails(true);
  }
};

  const getStatusClass = (status) => {
    const statusMap = {
      delivered: "delivered",
      "on the way": "on-the-way",
      cancelled: "cancelled",
      pending: "pending",
      preparing: "preparing",
      ready: "ready",
    };
    return (
      statusMap[status?.toLowerCase()] ||
      status?.toLowerCase().replace(" ", "-")
    );
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "dine_in":
        return <i className="bi bi-cup-hot"></i>;
      case "delivery":
        return <i className="bi bi-truck"></i>;
      case "takeaway":
        return <i className="bi bi-bag-check"></i>;
      default:
        return <i className="bi bi-box"></i>;
    }
  };

  const formatCurrency = (amount) => {
    // Ensure amount is a number
    const numAmount = Number(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

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

  // Helper function to get order total safely
  const getOrderTotal = (order) => {
    // Try different possible property names
    return Number(
      order?.total_amount || order?.total || order?.grand_total || 0,
    );
  };

  // Statistics for owner view
  const getStatistics = () => {
    const stats = {
      totalOrders: filteredOrders.length,
      totalRevenue: 0,
      averageOrderValue: 0,
      popularItems: {},
    };

    // Calculate total revenue
    stats.totalRevenue = filteredOrders.reduce((sum, order) => {
      const orderTotal = getOrderTotal(order);
      // console.log(`Order ${order.order_number}: ${orderTotal}`);
      return sum + orderTotal;
    }, 0);

    if (filteredOrders.length > 0) {
      stats.averageOrderValue = stats.totalRevenue / filteredOrders.length;
    }

    // Calculate popular items
    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const key = `${item.name}${item.variant ? ` (${item.variant})` : ""}`;
          stats.popularItems[key] =
            (stats.popularItems[key] || 0) + (item.quantity || 0);
        });
      }
    });

    // Sort popular items
    stats.popularItems = Object.entries(stats.popularItems)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    return stats;
  };

  if (loading) {
    return (
      <div className="order-history-loading">
        <div className="spinner"></div>
        <p className="loading-text">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-error">
        <i className="bi bi-exclamation-triangle"></i>
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
        <button
          onClick={() => dispatch(fetchOrderHistory())}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = getStatistics() ;

  return (
    <div className="order-history-page">
      {/* HEADER */}
      <div className="order-history-header">
        <div className="header-content">
          <h2>Order History</h2>
          <p>
            {userRole === "owner"
              ? "Complete overview of all restaurant orders"
              : "View your assigned orders"}
          </p>
        </div>
      </div>

        <div className="stats-cards">
          <div className="h-stat-card">
            <div className="h-stat-icon primary">
              <i className="bi bi-receipt"></i>
            </div>
            <div className="h-stat-content">
              <h4>Total Orders</h4>
              <div className="h-stat-value">{stats.totalOrders}</div>
            </div>
          </div>

          <div className="h-stat-card">
            <div className="h-stat-icon success">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="h-stat-content">
              <h4>Total Revenue</h4>
              <div className="h-stat-value">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>
          </div>

          <div className="h-stat-card">
            <div className="h-stat-icon warning">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div className="h-stat-content">
              <h4>Average Order</h4>
              <div className="h-stat-value">
                {formatCurrency(stats.averageOrderValue)}
              </div>
            </div>
          </div>
        </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by order number, customer name, or phone..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          {filters.search && (
            <button
              className="clear-search"
              onClick={() => handleFilterChange("search", "")}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
            <option value="on the way">On The Way</option>
            <option value="cancelled">Cancelled</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
          </select>

          <select
            className="filter-select"
            value={filters.orderType}
            onChange={(e) => handleFilterChange("orderType", e.target.value)}
          >
            <option value="all">All Order Types</option>
            <option value="dine_in">Dine In</option>
            <option value="delivery">Delivery</option>
            <option value="takeaway">Pickup</option>
          </select>

          <select
            className="filter-select"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>

          <button className="clear-filters" onClick={clearFilters}>
            <i className="bi bi-x-circle"></i>
            Clear Filters
          </button>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td>
                    <strong>#{order.order_number}</strong>
                    <div className="text-muted small">
                      {formatDate(order.created_at)}
                    </div>
                  </td>

                  <td>
                    <div>
                      {order.customer_name || order.customer?.name || "N/A"}
                    </div>
                    <small className="text-muted">
                      {order.customer_phone || order.customer?.phone || ""}
                    </small>
                  </td>

                  <td className="fw-bold">
                    {formatCurrency(getOrderTotal(order))}
                  </td>

                  <td>
                    <span
                      className={`order-status ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <span className="order-type-badge">
                      {getOrderTypeIcon(order.order_type)}
                      {order.order_type}
                    </span>
                  </td>

                  <td className="d-flex gap-2">
                    <button
                      className="action-btn view-details"
                      onClick={() => handleViewDetails(order)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-btn download">
                      <i className="bi bi-download"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <h4>No orders found</h4>
                  <p>Try adjusting your filters or search criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAILS MODAL */}
      {showDetails && selectedOrder && (
        <OrderDetails
          selectedOrder={selectedOrder}
          onClose={() => setShowDetails(false)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          getStatusClass={getStatusClass}
          getOrderTypeIcon={getOrderTypeIcon}
          getOrderTotal={getOrderTotal}
        />
      )}
    </div>
  );
};

export default OrderHistory;
