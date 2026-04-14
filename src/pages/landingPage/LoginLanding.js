import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../../features/auth/authSlice";
import SelectRestaurantModal from "../../components/SelectRestaurant/SelectRestaurant";
import "./LoginLanding.css";

const LoginLanding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ============================
     LOCAL STATE
  ============================ */
  const [mode, setMode] = useState(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, isLoading, isError, isSuccess, message } =
    useSelector((state) => state.auth);

  const handleStaffLogin = (e) => {
    e.preventDefault();

    // Clear old errors
    dispatch(reset());

    if (!userId || !password) {
      alert("Please enter ID & Password");
      return;
    }

    dispatch(
      login({
        username: userId,
        password: password,
      })
    );
  };

 useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);

    if (parsedUser?.accessToken) {
      if (parsedUser.accessibleRestaurants?.length > 1) {
        setShowRestaurantModal(true);
      } else {
        navigate("/menu-item", { replace: true });
      }
    }
  }
}, [navigate]);

  const handleRestaurantDone = () => {
    setShowRestaurantModal(false);
    navigate("/menu-item");
  };

  useEffect(() => {
    if (isSuccess && user) {
      if (user.accessibleRestaurants?.length > 1) {
        setShowRestaurantModal(true);
      } else {
        navigate("/menu-item", { replace: true });
      }
      dispatch(reset());
    }
  }, [isSuccess, user, navigate, dispatch]);

  return (
    <div className="login-landing">
      <div className="login-landing-card">
        {/* HEADER */}
        <div className="login-landing-header">
          <div className="logo-wrapper">
            <img
              src="./images/alvinpizza_logo.png"
              alt="Alvin Pizza"
              className="login-landing-logo"
            />
          </div>
          <h1 className="login-landing-title">Welcome Back</h1>
          <p className="login-landing-subtitle">Sign in to continue</p>
        </div>

        {mode === null ? (
          <div className="login-landing-choices">
            <button
              type="button"
              className="login-landing-btn staff-btn"
              onClick={() => setMode("staff")}
            >
              <div className="btn-icon">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div className="btn-text">
                <span>Staff Login</span>
                <small>POS & Billing Access</small>
              </div>
              <i className="bi bi-chevron-right btn-arrow"></i>
            </button>

            <div className="divider">
              <span>Demo Credentials</span>
            </div>
            <div className="demo-hint">
              <p><i className="bi bi-info-circle-fill"></i> Use: <strong>staff1</strong> / any password (multiple restaurants)</p>
              <p><i className="bi bi-info-circle-fill"></i> Use: <strong>single</strong> / any password (single restaurant)</p>
            </div>
          </div>
        ) : (
          /* LOGIN FORM */
          <form className="login-landing-form" onSubmit={handleStaffLogin}>
            {/* BACK BUTTON */}
            <button
              type="button"
              className="login-landing-back"
              onClick={() => {
                setMode(null);
                setUserId("");
                setPassword("");
                dispatch(reset());
              }}
            >
              <i className="bi bi-arrow-left-short"></i> Back
            </button>

            <h2 className="login-landing-form-title">
              <i className="bi bi-shield-lock"></i>
              Staff Authentication
            </h2>

            {/* ERROR MESSAGE */}
            {isError && (
              <div className="login-landing-error">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{message || "Login failed. Please check your credentials."}</span>
              </div>
            )}

            {/* USERNAME */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-person-badge"></i> User ID / Email
              </label>
              <div className="input-wrapper">
                <i className="bi bi-person input-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your staff ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-key"></i> Password
              </label>
              <div className="input-wrapper">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} eye-icon`}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                ></i>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="login-landing-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Login to Dashboard
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <SelectRestaurantModal
        show={showRestaurantModal}
        onClose={() => setShowRestaurantModal(false)}
        onSelectDone={handleRestaurantDone}
      />
    </div>
  );
};

export default LoginLanding;