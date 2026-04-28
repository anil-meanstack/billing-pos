import React, { useState, useMemo } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTableNumber, setTableId, updateTable, setOrderType } from "../../features/cart/cartSlice";
import Alert from "../Alert/Alert";


const Sidebar = () => {
  const tables = useSelector((state) => state.tables.list);
  const { orders } = useSelector((state) => state.orders);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const orderType = useSelector((state) => state.cart.orderType);
  const { newCount = 0, preparingCount = 0, readyCount = 0 } = useSelector(
    (state) => state.kitchen
  );

  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "danger",
  });

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


  const handleTableClick = (table) => {

    const unavailableStatuses = ["reserved", "booked", "maintenance"];

    if (unavailableStatuses.includes(table.status?.toLowerCase())) {
      setShowAlert({
        show: true,
        message: `Table ${table.tableNumber} is ${table.status} and cannot be selected`,
        type: "danger",
      });
      return;
    }

    const isOccupied = table.status?.toLowerCase() === "occupied";

    setSelectedTableId(table.id);

    dispatch(setTableNumber(table.tableNumber));
    dispatch(setTableId(table.id));

    dispatch(setOrderType("dine_in"));

    if (orderType === "dine_in") {
      dispatch(updateTable({
        table_id: table.id,
        order_type: "dine_in",
      }));
    }

    localStorage.setItem('selectedTable', JSON.stringify({
      number: table.tableNumber,
      id: table.id
    }));

    setShowAlert({
      show: true,
      message: isOccupied
        ? `⚠️ Opening running order for Table ${table.tableNumber}`
        : `Table ${table.tableNumber} selected successfully`,
      type: isOccupied ? "warning" : "success",
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
      {/* ORDERS */}
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

        <div className="table-grid">
          {tables.map((t, i) => {
            const isSelectable = isTableSelectable(t.status);
            const isOccupied = t.status?.toLowerCase() === "occupied";

            return (
              <div
                key={i}
                className={`table-card 
                  ${selectedTableId === t.id ? "active" : ""}
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
                  <div className="occupancy-indicator">
                    <span className="occupancy-dot"></span>
                  </div>
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