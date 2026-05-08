import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setTableNumber, setTableId, updateTable, setOrderType, loadTableOrders } from "../../features/cart/cartSlice";

const Table = ({ setShowAlert }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tables = useSelector((state) => state.tables.list);
    const { orders } = useSelector((state) => state.orders);
    const reduxSelectedTableId = useSelector((state) => state.cart.tableId);
    const { cartSummary, cartData } = useSelector((state) => state.cart);

    const getStatusClass = (status) => {
        if (!status) return "available";
        return status.toLowerCase();
    };

    const isTableSelectable = (status) => {
        const unavailableStatuses = ["reserved", "booked", "maintenance"];
        return !unavailableStatuses.includes(status?.toLowerCase());
    };

    const getTableOrder = (tableId) => {
        return orders
            ?.filter(
                (order) =>
                    order.order_type === "dine_in" &&
                    order.table === tableId &&
                    order.payment_status === "pending" &&
                    !["completed", "cancelled"].includes(order.status?.toLowerCase())
            )
            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    };

    const getTableDisplayStatus = (table, activeOrder) => {
        if (reduxSelectedTableId === table.id) return "Active";

        if (table.has_active_cart) return "Saved";
        if (!activeOrder) return "Free";

        const status = activeOrder.status?.toLowerCase();

        if (status === "ready") return "Ready";

        if (["confirmed", "pending", "preparing", "cooking"].includes(status)) {
            return "cooking";
        }

        return activeOrder.status_display || activeOrder.status;
    };


    const timeAgo = (dateString) => {
        if (!dateString) return "";

        const now = new Date();
        const created = new Date(dateString);
        const diffMs = now - created;

        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        return `${diffDay}d ago`;
    };

    // const handleTableClick = async (table) => {
    //     const activeOrder = getTableOrder(table.id);
    //     const unavailableStatuses = ["reserved", "booked", "maintenance"];

    //     if (unavailableStatuses.includes(table.status?.toLowerCase())) {
    //         setShowAlert({
    //             show: true,
    //             message: `Table ${table.tableNumber} is ${table.status} and cannot be selected`,
    //             type: "danger",
    //         });
    //         return;
    //     }

    //     dispatch(setTableNumber(table.tableNumber));
    //     dispatch(setTableId(table.id));
    //     dispatch(setOrderType("dine_in"));

    //     if (activeOrder || table.has_active_cart || table.has_active_order) {
    //         await dispatch(loadTableOrders(table.id)).unwrap();
    //         navigate("/menu-item");
    //         return;
    //     }

    //     dispatch(clearRunningOrder());

    //     await dispatch(
    //         updateTable({
    //             table_id: table.id,
    //             order_type: "dine_in",
    //         })
    //     ).unwrap();

    //     navigate("/menu-item");

    //     localStorage.setItem(
    //         "selectedTable",
    //         JSON.stringify({
    //             number: table.tableNumber,
    //             id: table.id,
    //         })
    //     );

    //     setShowAlert({
    //         show: true,
    //         message: `Table ${table.tableNumber} selected successfully`,
    //         type: "success",
    //     });
    // };

    const handleTableClick = async (table) => {
        const activeOrder = getTableOrder(table.id);

        if (["reserved", "booked", "maintenance"].includes(table.status?.toLowerCase())) {
            setShowAlert({
                show: true,
                message: `Table ${table.tableNumber} is ${table.status} and cannot be selected`,
                type: "danger",
            });
            return;
        }

        dispatch(setTableNumber(table.tableNumber));
        dispatch(setTableId(table.id));
        dispatch(setOrderType("dine_in"));

        localStorage.setItem(
            "selectedTable",
            JSON.stringify({
                number: table.tableNumber,
                id: table.id,
            })
        );

        await dispatch(updateTable({
            table_id: table.id,
            order_type: "dine_in",
        })).unwrap();

        if (activeOrder || table.has_active_order) {
            await dispatch(loadTableOrders(table.id)).unwrap();
        }

        navigate("/menu-item");
        localStorage.setItem(
            "selectedTable",
            JSON.stringify({
                number: table.tableNumber,
                id: table.id,
            })
        );

        setShowAlert({
            show: true,
            message: `Table ${table.tableNumber} selected successfully`,
            type: "success",
        });
    };

    return (
        <div className="table-grid">
            {tables.map((t, i) => {
                const isSelectable = isTableSelectable(t.status);

                const activeOrder = getTableOrder(t.id);

                const isOccupied =
                    t.status?.toLowerCase() === "occupied" ||
                    !!activeOrder ||
                    t.has_active_cart ||
                    t.has_active_order;

                const isCurrentCartTable =
                    cartSummary?.tableNumber === t.tableNumber ||
                    cartData?.table_number === t.tableNumber;

                const tableItemCount =
                    (t.cart_item_count || activeOrder?.item_count)
                        ? (activeOrder?.item_count || t.cart_item_count)
                        : (isCurrentCartTable
                            ? (cartSummary?.itemCount || cartData?.item_count || 0)
                            : 0);

                const tableTotalAmount =
                    (t.cart_subtotal || activeOrder?.total_amount)
                        ? (activeOrder?.total_amount || t.cart_subtotal)
                        : (isCurrentCartTable
                            ? (cartSummary?.total_amount || cartData?.total_amount || 0)
                            : 0);

                const displayStatus = getTableDisplayStatus(t, activeOrder);
                const statusClass = displayStatus.toLowerCase();

                return (
                    <div
                        key={i}
                        className={`table-card 
              ${reduxSelectedTableId === t.id ? "active" : ""}
              ${t.highlight ? "highlight" : ""}
              ${getStatusClass(t.status)}
              ${statusClass}
              ${!isSelectable ? "disabled" : ""}
              ${isOccupied ? "occupied" : ""}`}
                        onClick={() => handleTableClick(t)}
                        style={{
                            cursor: isSelectable ? "pointer" : "not-allowed",
                            opacity: isSelectable ? 1 : 0.6,
                            pointerEvents: "auto",
                        }}
                        title={
                            !isSelectable
                                ? `Table ${t.tableNumber} is ${t.status || "unavailable"}`
                                : `Select Table ${t.tableNumber}`
                        }
                    >
                        <div className="tc-wrap">
                            <div className="tc-left">
                                <div className="table-id">{t.tableNumber}</div>

                                <div className={`table-status ${getStatusClass(t.status)}`}>
                                    {isOccupied
                                        ? `${tableItemCount} items-₹${Number(tableTotalAmount).toFixed(2)}`
                                        : "Available"}
                                </div>
                            </div>

                            <div className="tc-right">
                                <div className={`table-status ${statusClass}`}>
                                    {displayStatus}
                                </div>
                            </div>
                        </div>

                        {isOccupied && (
                            <div className="tc-strip">
                                <span className="tc-strip-oid">
                                    {activeOrder ? `#${activeOrder.daily_number}` : "Saved"}
                                </span>

                                <span className="tc-strip-items">
                                    {tableItemCount} items
                                </span>

                                <span className="tc-strip-timer">
                                    {timeAgo(activeOrder?.created_at)}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Table;