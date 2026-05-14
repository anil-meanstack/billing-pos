import { useState, useMemo, useEffect } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Table from "../Table/Table";
import Alert from "../Alert/Alert";

const Sidebar = () => {
  const { orders } = useSelector((state) => state.orders);
  const [tableSelectError, setTableSelectError] = useState("");
  const { newCount = 0, preparingCount = 0, readyCount = 0 } = useSelector(
    (state) => state.kitchen
  );
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    loadUpdateInfo();
  }, []);
  
  const loadUpdateInfo = async () => {
    if (window.electronAPI?.checkUpdateInfo) {
      const info = await window.electronAPI.checkUpdateInfo();
      setUpdateInfo(info);
    }
  };

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


  const handleUpdate = async () => {
    if (window.electronAPI?.checkForUpdates) {
      const result = await window.electronAPI.checkForUpdates();

      if (result.success) {
        setUpdateInfo(result);
        alert("Checking for updates...");
      } else {
        alert(result.message);
      }
    }
  };


  const totalKitchenOrder = (newCount || 0) + (preparingCount || 0) + (readyCount || 0);


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
        <Table setShowAlert={setShowAlert} />

      </div>
      <div className="section">
        <NavLink to="/staff" className={({ isActive }) => isActive ? "item active " : "item"}>
          <i className="bi bi-person"></i>
          <span>Manage Staff</span>
        </NavLink>
      </div>
      {/* <div className="section">
        <button
          type="button"
          className="item update-menu-btn"
          onClick={handleUpdate}
        >
          <i className="bi bi-arrow-repeat"></i>

          <span>Check for Updates</span>

          {updateInfo?.updateAvailable && (
            <span className="update-badge">
              New
            </span>
          )}
        </button>

        <div className="update-tooltip">

          <div className="tooltip-title">
            Restart to Update
          </div>

          <div>
            Billing POS
          </div>

          <div>
            Current Version: {updateInfo?.currentVersion}
          </div>

          <div>
            Latest Version: {updateInfo?.latestVersion || "Latest"}
          </div>

          <div>
            Released {updateInfo?.releaseDate || "-"}
          </div>

        </div>
      </div> */}

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