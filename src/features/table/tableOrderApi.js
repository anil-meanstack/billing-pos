const API_BASE_URL = process.env.REACT_APP_API_BASE_URL



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
const getRestaurantId = () => {
  const auth = getAuthData();

  return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
};
const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null;
};

export const fetchTableOrdersApi = async (tableId) => {
  try {
    const token = getToken();
    const restaurantId = getRestaurantId();

    const response = await fetch(
      `${API_BASE_URL}/tables/${tableId}/orders/?restaurant_id=${restaurantId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return { results: [] };
    }

    return await response.json();

  } catch (error) {
    console.error("Table Orders API Error:", error);
    return { results: [] };
  }
};

export const fetchAllOrdersApi = async () => {
  try {
    const token = getToken();
    const restaurantId = getRestaurantId();
    const response = await fetch(
      `${API_BASE_URL}/orders/?restaurant_id=${restaurantId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const orders = await response.json();
 
    const ordersList = orders.results || orders || [];

    const activeStatuses = [
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "occupied",
      "pending",
    ];

    const activeOrders = ordersList.filter((order) =>
      activeStatuses.includes(order.status?.toLowerCase())
    );


    const detailedOrders = activeOrders.map((order) => ({
      id: order.id,
      tableNumber:
        order.order_type === "takeaway"
          ? `TA-${order.id}`
          : `DL-${order.id}`,
      status: order.status,
      amount: parseFloat(order.total_amount || 0),
      orderId: order.id,
      order_type: order.order_type,
      order_status: order.status,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      type: order.order_type,
      isVirtualTable: true,
      createdAt: order.created_at,
      order_number: order.order_number,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      orderDetails: order,   // reuse existing order data
    }));

    const nonDineInOrders = detailedOrders
      .filter(Boolean)
      .filter((order) => order.order_type !== "dine_in");

    return nonDineInOrders;
  } catch (error) {
    console.error("All Orders API Error:", error);
    return [];
  }
};