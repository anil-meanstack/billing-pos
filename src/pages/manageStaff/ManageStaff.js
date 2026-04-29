import { useEffect, useState  } from "react";
import "./ManageStaff.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const ManageStaff = () => {
    const [staffData, setStaffData] = useState([]);
    const getAuthData = () => {
        const userData = localStorage.getItem("user");
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    };

    const getToken = () => {
        const auth = getAuthData();
        return auth?.accessToken || null;
    };

    const getRestaurantId = () => {
        const auth = getAuthData();
        return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
    };

    const formatStaffData = (users) => {
        return users.map((user) => ({
            id: user.id,
            name: user.full_name,
            role: "Staff",
            status: user.is_active ? "onDuty" : "offDuty",
            orders: user.total_orders || 0,
            hours: "0h",
            tips: Number(user.total_sales) || 0,
        }));
    };

    useEffect(() => {
        const restaurantId = getRestaurantId();
        const token = getToken();

        if (!restaurantId || !token) {
            console.error("Missing token or restaurantId");
            return;
        }

        fetch(`${API_BASE_URL}/staff-manager/?restaurant_id=${restaurantId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const formatted = formatStaffData(data.users);
                    setStaffData(formatted);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="manage-staff">

            <div className="header">
                <h2 className="page-title">Manage Staff</h2>
            </div>

            <div className="summary">
                <div className="card">
                    <h4 className="sv">{staffData.length}</h4>
                    <p className="sl">Total Staff</p>
                    <p className="sc">
                        {staffData.filter(s => s.status === "onDuty").length} on duty
                    </p>
                </div>

                <div className="card">
                    <h4 className="sv">
                        {staffData.filter(s => s.status === "onDuty").length}
                    </h4>
                    <p className="sl">Currently On Duty</p>
                </div>

                <div className="card">
                    <h4 className="sv">
                        ₹{staffData.reduce((acc, s) => acc + s.tips, 0)}
                    </h4>
                    <p className="sl">Today's Payroll</p>
                </div>
            </div>

            <div className="staff-grid mt-3">
                {staffData.map((staff) => (
                    <div className="scard2" key={staff.id}>

                        <div className="staff-header mb-3">
                            <div className="sav">
                                {staff.name
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h4 className="snm">{staff.name}</h4>
                                <p className="sbdgs">{staff.role}</p>
                            </div>

                            <span className={`sbdg ${staff.status}`}>
                                {staff.status === "onDuty"
                                    ? "ON DUTY"
                                    : "OFF DUTY"}
                            </span>
                        </div>

                        <div className="stats">
                            <div className="sst">
                                <h4 className="snm">{staff.orders}</h4>
                                <p className="sstl">Orders</p>
                            </div>
                            <div className="sst">
                                <h4 className="snm">{staff.hours}</h4>
                                <p className="sstl">Hours</p>
                            </div>
                            <div className="sst">
                                <h4 className="snm">₹{staff.tips}</h4>
                                <p className="sstl">Tips</p>
                            </div>
                        </div>

                        <div className="progress-box mb-3">
                            <div className="progress-top">
                                <span>Shift progress</span>
                                <span>70%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: "70%" }}></div>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="sact break">Break</button>
                            <button className="sact">Sign Out</button>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default ManageStaff;