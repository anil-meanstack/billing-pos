import { useState, useMemo, useEffect } from "react";
import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTableNumber, setTableId, updateTable, setOrderType, loadTableOrders, clearRunningOrder } from "../../features/cart/cartSlice";
import Alert from "../Alert/Alert";

const Sidebar = () => {
  const tables = useSelector((state) => state.tables.list);
  const { orders } = useSelector((state) => state.orders);
  const [tableSelectError, setTableSelectError] = useState("");
  const navigate = useNavigate();
  const reduxSelectedTableId = useSelector((state) => state.cart.tableId);
  const { newCount = 0, preparingCount = 0, readyCount = 0 } = useSelector(
    (state) => state.kitchen
  );

  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  useEffect(() => {
    let timer;

    const handleTableError = (e) => {
      const message = e.detail || "↓";

      setTableSelectError(message);

      setShowAlert({
        show: true,
        message,
        type: "danger",
      });

      clearTimeout(timer);
      timer = setTimeout(() => {
        setTableSelectError("");
      }, 5000);
    };

    window.addEventListener("SHOW_TABLE_SELECT_ERROR", handleTableError);

    return () => {
      window.removeEventListener("SHOW_TABLE_SELECT_ERROR", handleTableError);
      clearTimeout(timer);
    };
  }, []);

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

  const totalKitchenOrder = (newCount || 0) + (preparingCount || 0) + (readyCount || 0);

  const handleTableClick = async (table) => {
    const unavailableStatuses = ["reserved", "booked", "maintenance"];

    if (unavailableStatuses.includes(table.status?.toLowerCase())) {
      setShowAlert({
        show: true,
        message: `Table ${table.tableNumber} is ${table.status} and cannot be selected`,
        type: "danger",
      });
      return;
    }
    setTableSelectError("");

    dispatch(setTableNumber(table.tableNumber));
    dispatch(setTableId(table.id));
    dispatch(setOrderType("dine_in"));

    dispatch(clearRunningOrder());

    dispatch(updateTable({
      table_id: table.id,
      order_type: "dine_in",
    }));
    navigate("/menu-item")
    localStorage.setItem("selectedTable", JSON.stringify({
      number: table.tableNumber,
      id: table.id,
    }));

    setShowAlert({
      show: true,
      message: `Table ${table.tableNumber} selected successfully`,
      type: "success",
    });
  };
  const getStatusClass = (status) => {
    if (!status) return "available";
    return status.toLowerCase();
  };

  const isTableSelectable = (status) => {
    const unavailableStatuses = ["reserved", "booked", "maintenance"];
    return !unavailableStatuses.includes(status?.toLowerCase());
  };

  return (
    <div className="sidebar">
      <div className="section">
        <p className="section-title">ORDERS</p>

        <NavLink to="/menu-item" className={({ isActive }) => isActive ? "item active" : "item"}>
          <i className="bi bi-grid"></i>
          <span>New Order</span>
        </NavLink>

        <NavLink to="/order" className={({ isActive }) => isActive ? "item active" : "item"}>
          <i className="bi bi-list"></i>
          <span>Order History</span>
          <span className="badge orange">{todayOrders.length}</span>
        </NavLink>

        <NavLink to="/kitchen" className={({ isActive }) => isActive ? "item active" : "item"}>
          <i className="bi bi-clock"></i>
          <span>Kitchen Queue</span>
          <span className="badge orange">{totalKitchenOrder}</span>
        </NavLink>

      </div>

      {/* TABLES */}
      <div className="section">
        <p className="section-title">TABLES</p>
        {tableSelectError && (
          <div className="chev-indicator">
            <div className="chevron-stack">
              <div className="chev">
                <svg viewBox="0 0 18 10" fill="none" width="18" height="10">
                  <path d="M2 2l7 6 7-6" stroke="#e05c20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="chev">
                <svg viewBox="0 0 18 10" fill="none" width="18" height="10">
                  <path d="M2 2l7 6 7-6" stroke="#e05c20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="chev">
                <svg viewBox="0 0 18 10" fill="none" width="18" height="10">
                  <path d="M2 2l7 6 7-6" stroke="#e05c20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="table-grid">
          {tables.map((t, i) => {
            const isSelectable = isTableSelectable(t.status);
            const isOccupied = t.status?.toLowerCase() === "occupied";

            return (
              <div
                key={i}
                className={`table-card 
                  ${reduxSelectedTableId === t.id ? "active" : ""}
                  ${t.highlight ? "highlight" : ""}
                  ${getStatusClass(t.status)}
                  ${!isSelectable ? "disabled" : ""}
                  ${isOccupied ? "occupied" : ""}`}
                onClick={() => handleTableClick(t)}
                style={{
                  cursor: isSelectable ? "pointer" : "not-allowed",
                  opacity: isSelectable ? 1 : 0.6,
                  pointerEvents: "auto"
                }}
                title={!isSelectable ? `Table ${t.tableNumber} is ${t.status || 'unavailable'}` : `Select Table ${t.tableNumber}`}
              >
                <div className="table-id">{t.tableNumber}</div>
                <div className={`table-status ${getStatusClass(t.status)}`}>
                  {t.status || "Available"}
                </div>
                {isOccupied && (
                  <>
                    <div className="occupancy-indicator">
                      <span className="occupancy-dot"></span>
                    </div>

                    <div className="view-wrapper">
                      <i
                        className="bi bi-eye-fill view"
                        onClick={async (e) => {
                          e.stopPropagation();

                          dispatch(setTableNumber(t.tableNumber));
                          dispatch(setTableId(t.id));
                          dispatch(setOrderType("dine_in"));

                          await dispatch(loadTableOrders(t.id)).unwrap();
                          navigate("/menu-item");
                        }}
                      ></i>

                      <span className="tooltip-text">View Order</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="section">
        <NavLink to="/staff" className={({ isActive }) => isActive ? "item active" : "item"}>
          <i className="bi bi-person"></i>
          <span>Manage Staff</span>
        </NavLink>
      </div>

      <Alert
        show={showAlert.show}
        message={showAlert.message}
        type={showAlert.type}
        onClose={() => setShowAlert({ ...showAlert, show: false })}
      />
    </div>
  );
};

export default Sidebar;