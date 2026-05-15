import "./App.css";
import ItemGrid from "./pages/menu/ItemGrid";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginLanding from "./pages/landingPage/LoginLanding";
import ProtectedRoute from "./routes/ProtectedRoute";
import KitchenQueue from "./pages/kitchenQueue/KitchenQueue"
import Orders from "./pages/orders/Orders";
import ManageStaff from "./pages/manageStaff/ManageStaff";

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";


  const getAuthData = () => {
    const data = localStorage.getItem("user");
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Invalid user data in localStorage");
      return null;
    }
  };

  const restaurantName = () => {
    const auth = getAuthData();
    return auth?.currentRestaurant?.name || "No Restaurant Selected";
  };

  const restaurant = restaurantName()


  return (
    <>
      {hideSidebar ? (
        <Routes>
          <Route path="/" element={<LoginLanding />} />
        </Routes>
      ) : (
        <div className="appLayout">
          {/* Navbar */}
          <Navbar resturentName={restaurant} />

          <div className="mainBody">
            {/* Sidebar */}
            <Sidebar />

            {/* Page Content */}
            <div className="pageContent">
              <Routes>
                <Route
                  path="/menu-item"
                  element={
                    <ProtectedRoute>
                      <ItemGrid />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute>
                      <KitchenQueue />
                    </ProtectedRoute>
                  }
                />
               
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute>
                      <ManageStaff />
                    </ProtectedRoute>
                  }
                />

                {/* <Route
                  path="/online-order"
                  element={
                    <ProtectedRoute>
                      <OnlineOrder />
                    </ProtectedRoute>
                  }
                /> */}

              </Routes>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
