import { useEffect, useState } from "react";
import "./Navbar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState(null);
  const tableNumber = useSelector((state) => state.cart.tableNumber);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const orderType = useSelector((state) => state.cart.orderType);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getOrderTypeLabel = () => {
    switch (orderType) {
      case "dine_in":
        return "Dine In";
      case "takeaway":
        return "Take Away";
      case "delivery":
        return "Delivery";
      default:
        return "";
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setUserName(parsed.user?.full_name);
        } catch {
          setUserName(null);
        }
      } else {
        setUserName(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };


  return (
    <div className="pos-header">
      <div className="pos-left">
        <div className="logo-box">
          <i className="bi bi-display"></i>
        </div>

        <div className="brand">
          {props.resturentName || "Alvin Pizza POS"}
          <span className="ms-2">POS</span>
        </div>

        <div className="table-badge">
          {orderType === "dine_in"
            ? `Table ${tableNumber || "-"} · ${getOrderTypeLabel()}`
            : getOrderTypeLabel()}
        </div>

        <div className="status">
          <span className="dot green"></span>
          Kitchen Open
        </div>

        <div className="status">
          <span className="dot red"></span>
          0 Pending KOTs
        </div>

        <div className="status">
          <span className={`dot ${isOnline ? "green" : "red"}`}></span>
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>

      <div className="pos-right">
        <div className="time">{time}</div>

        <div className="shift">Morning Shift</div>

        {userName ? (
          <div className="d-flex align-items-center gap-3">
            <span className="user-badge text-capitalize">
              <i className="bi bi-person-circle me-1"></i>
              {userName}
            </span>

            <i
              className="bi bi-box-arrow-right icon-logout"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            ></i>
          </div>
        ) : (
          <button
            className="btn login-btn fw-bold px-4"
            onClick={() => setShowLogin(true)}
          >
            <i className="bi bi-person-circle me-1"></i>
            LOGIN
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;