import { useEffect, useState, useMemo } from "react";
import "./Orders.css";
import { fetchOrderHistory } from "../../features/orders/ordersSlice";
import { useDispatch, useSelector } from "react-redux";
import { orderStatus } from "../../features/table/tableApi";
import OrderDetailsModal from "../components/OrderDetailsModal";
import CancelModal from "../menu/components/Modal/CancelModal";

const Orders = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.orders);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState("column");
    const [expandedOrders, setExpandedOrders] = useState({});
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);

    useEffect(() => {
        dispatch(fetchOrderHistory());
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        const pollInterval = setInterval(() => {
            dispatch(fetchOrderHistory());
        }, 7000);
        return () => {
            clearInterval(timeInterval);
            clearInterval(pollInterval);
        };
    }, [dispatch]);


    const todayOrders = useMemo(() => {
        if (!orders) return [];

        const today = new Date();

        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0, 0, 0, 0
        );

        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23, 59, 59, 999
        );

        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startOfDay && orderDate <= endOfDay;
        });
    }, [orders]);

    const statistics = useMemo(() => {
        if (!todayOrders || todayOrders.length === 0) {
            return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, itemsSold: 0 };
        }
        const totalRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
        const totalItemsSold = todayOrders.reduce((sum, order) => {
            const itemCount = order.items?.length || order.item_count || 0;
            return sum + itemCount;
        }, 0);
        return {
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders: todayOrders.length,
            avgOrderValue: todayOrders.length > 0 ? (totalRevenue / todayOrders.length).toFixed(2) : 0,
            itemsSold: totalItemsSold
        };
    }, [todayOrders]);

    const orderFlow = {
        confirmed: { nextStatus: "preparing", buttonLabel: "▶ Start Preparing" },
        preparing: { nextStatus: "ready", buttonLabel: "✓ Mark Ready" },
        ready: { nextStatus: "completed", buttonLabel: "✓ Served" },
    };

    const handleStatusClick = async (orderId, currentStatus) => {
        const flow = orderFlow[currentStatus];
        if (!flow) return;

        const { nextStatus } = flow;

        dispatch({
            type: 'orders/updateOrderStatusLocal',
            payload: { orderId, status: nextStatus }
        });

        try {
            await orderStatus.updateOrderStatus(orderId, { status: nextStatus });
            // Optionally refetch orders
            dispatch(fetchOrderHistory());
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };
    const handleConfirmCancel = async () => {
        try {
            dispatch({
                type: 'orders/updateOrderStatusLocal',
                payload: { orderId: cancelOrderId, status: "cancelled" }
            });

            await orderStatus.updateOrderStatus(cancelOrderId, {
                status: "cancelled"
            });

            dispatch(fetchOrderHistory());
        } catch (error) {
            console.error(error);
        } finally {
            setShowCancelModal(false);
            setCancelOrderId(null);
        }
    };
    const filteredOrders = useMemo(() => {
        if (!todayOrders) return [];
        let filtered = [...todayOrders];
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(order => order.status === selectedCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_number?.toLowerCase().includes(term) ||
                order.customer_name?.toLowerCase().includes(term) ||
                order.table_number?.toString().includes(term) ||
                order.customer?.name?.toLowerCase().includes(term)
            );
        }
        return filtered;
    }, [todayOrders, selectedCategory, searchTerm]);

    const getFormattedDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getOrderTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'dine_in':
                return <i className="bi bi-fork-knife"></i>;
            case 'takeaway':
                return <i className="bi bi-bag"></i>;
            case 'delivery':
                return <i className="bi bi-truck"></i>;
            default:
                return <i className="bi bi-fork-knife"></i>;
        }
    };


    const getCustomerName = (order) => {
        if (order.customer_name) return order.customer_name;
        if (order.customer?.name) return order.customer.name;
        if (order.customer_name_display) return order.customer_name_display;
        return 'Guest';
    };

    const getTableInfo = (order) => {
        if (order.table_number) return order.table_number;
        if (order.table?.number) return order.table.number;
        if (order.table_id) return order.table_id;
        return null;
    };

    const categories = [
        { id: 'all', label: 'All', count: todayOrders.length },
        { id: 'completed', label: 'Completed', count: todayOrders.filter(o => o.status === 'completed').length },
        { id: 'preparing', label: 'Preparing', count: todayOrders.filter(o => o.status === 'preparing').length },
        { id: 'confirmed', label: 'Pending', count: todayOrders.filter(o => o.status === 'confirmed').length },
        { id: 'cancelled', label: 'Cancelled', count: todayOrders.filter(o => o.status === 'cancelled').length }
    ];

    const toggleItems = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const getPaymentIcon = (method) => {
        const type = (method || "").toLowerCase();

        switch (type) {
            case "cash":
                return <i className="bi bi-cash-stack"></i>;

            case "upi":
                return <i className="bi bi-phone"></i>;

            case "card":
            case "credit card":
            case "debit card":
                return <i className="bi bi-credit-card"></i>;

            case "online":
                return <i className="bi bi-globe"></i>;

            default:
                return <i className="bi bi-wallet2"></i>;
        }
    };


    return (
        <div className="orders-container">
            {/* Header Section */}
            <div className="orders-header">
                <div className="header-left">
                    <h1 className="page-title">Today's Orders</h1>
                    <p className="header-date">{getFormattedDate()}</p>
                </div>
                <div className="header-right">
                    <div className="search-box">
                        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-card-primary">
                    <div className="stat-icon"><i className="bi bi-cash-stack"></i></div>
                    <div className="stat-content">
                        <div className="stat-value">₹{statistics.totalRevenue}</div>
                        <div className="stat-label">Today's Revenue</div>
                        <div className="stat-sub">{statistics.totalOrders} orders today</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><i className="bi bi-bar-chart-line"></i></div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.totalOrders}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><i className="bi bi-graph-up-arrow"></i></div>
                    <div className="stat-content">
                        <div className="stat-value">₹{statistics.avgOrderValue}</div>
                        <div className="stat-label">Avg Order Value</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><i className="bi bi-bag-check"></i></div>
                    <div className="stat-content">
                        <div className="stat-value">{statistics.itemsSold}</div>
                        <div className="stat-label">Items Sold</div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="categories-container">
                <div className="categories-scroll">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <span className="category-label">{category.label}</span>
                            <span className="category-count">{category.count}</span>
                        </button>
                    ))}
                </div>
                <div className="view-toggle">
                    <button
                        className={viewType === "column" ? "active" : ""}
                        onClick={() => setViewType("column")}
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
            </div>

            {/* Orders List */}
            <div className={`orders-list ${viewType}`}>
                {todayOrders.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3 className="empty-state-title">No orders today</h3>
                        <p className="empty-state-text">Orders will appear here once placed</p>
                    </div>
                )}

                {todayOrders.length > 0 && filteredOrders.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3 className="empty-state-title">No matching orders</h3>
                        <p className="empty-state-text">
                            {searchTerm ? `No orders matching "${searchTerm}"` : `No ${selectedCategory} orders today`}
                        </p>
                    </div>
                )}

                {filteredOrders.map((order) => (

                    <div key={order.id} className={`order-cards order-type-${order.order_type || 'dine_in'}`}>
                        <div className="orders-cards">
                            <div className="order-left">

                                {order?.kot_number && (
                                    <span className="order-id">
                                        #{order.kot_number}
                                    </span>
                                )}

                                <div className="order-info">
                                    <div className="table-text">
                                        {getTableInfo(order) && `Table: ${getTableInfo(order)} -`} {" "}
                                        <span className="order-type-icon"> {getOrderTypeIcon(order.order_type)}</span>
                                        {order.order_type_display || order.order_type || "Dine In"}
                                    </div>

                                    {/* Time */}
                                    <div className="order-time">
                                        <h5 className="customer-name">{getCustomerName(order)} -</h5>
                                        {new Date(order.created_at).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}{" "}
                                    </div>

                                </div>
                            </div>
                            <div className={`order-status ${order.status}`}>
                                {order.status}
                            </div>

                        </div>

                        {order.items && order.items.length > 0 && (
                            <div>
                                {order.items && order.items.length > 0 && (
                                    <div className={`order-items-preview ${expandedOrders[order.id] ? "expanded" : ""}`}>
                                        <div className="items-inner">
                                            {(expandedOrders[order.id] ? order.items : order.items.slice(0, 6))
                                                .map((item, idx) => (
                                                    <div key={idx} className="preview-item">
                                                        <span className="item-quantity">{item.quantity}x</span>
                                                        <span className="item-names">
                                                            {item.name || item.product_name}

                                                            {item.variants?.length > 0 && (
                                                                <span className="item-variants">
                                                                    {" ("}
                                                                    {item.variants.map((v, i) => (
                                                                        <span key={i}>{v.name}</span>
                                                                    ))}
                                                                    {")"}
                                                                </span>
                                                            )}
                                                        </span>

                                                        {/* ADDONS */}
                                                        {item.addons && item.addons.length > 0 && (
                                                            <div className="item-addons mt-0">
                                                                + {item.addons.map(a => a.name).join(", ")}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>

                                        {order.items.length > 6 && (
                                            <div
                                                className="more-items"
                                                onClick={() => toggleItems(order.id)}
                                            >
                                                {expandedOrders[order.id]
                                                    ? "Show Less"
                                                    : `+${order.items.length - 6} more`}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="order-summarys">
                            <div className="items-info">
                                <span>
                                    {getPaymentIcon(order.paymentMethod || order.payment_method_display)}
                                </span>
                                <span >{order.paymentMethod ?? order.payment_method_display}</span>
                            </div>
                            <div className="total-amount">
                                <span>₹{parseFloat(order.total_amount || order.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="order-footer">

                            {(order.status || "").toLowerCase() !== "completed" &&
                                orderFlow[order.status] && (
                                    <button
                                        className={`btn-update start-btn ${order.status === 'preparing' || order.status === 'ready'
                                            ? 'ready-btn'
                                            : ''
                                            }`}
                                        onClick={() => handleStatusClick(order.id, order.status)}
                                    >
                                        {orderFlow[order.status].buttonLabel}
                                    </button>
                                )}

                            <div className="action-buttons">
                                <button className="btn-view" onClick={() => {
                                    setSelectedOrder(order);
                                    setShowReceiptModal(true);
                                }}>
                                    🧾 Receipt
                                </button>
                            </div>

                            {order.status !== "completed" && (
                                <div className="action-buttons">
                                    <button
                                        className="btn-cancel"
                                        onClick={() => {
                                            setCancelOrderId(order.id);
                                            setShowCancelModal(true);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>

            {showReceiptModal && selectedOrder && (
                <OrderDetailsModal
                    lastOrder={selectedOrder}
                    setShowReceiptModal={setShowReceiptModal}
                />
            )}

            <CancelModal
                show={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                message="Are you sure you want to cancel this order?"
            />
        </div>
    );
};

export default Orders;