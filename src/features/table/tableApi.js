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
const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null; 
};

const getRestaurantId = () => {
  const auth = getAuthData();
  return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
};

export const fetchTablesApi = async () => {
  const id = getRestaurantId();

  if (!id) {
    console.error("Restaurant ID missing");
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/public/tables/?restaurant=${id}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tables");
    }

    const data = await response.json();

     return data.map((table) => ({
      id: table.id,
      tableNumber: table.table_number,
      capacity: table.capacity,
      status: table.status,
      isAvailable: table.is_available,
      amount: 0,
      orderId: null,
    }));

  } catch (error) {
    console.error("Table API Error:", error);
    return [];
  }
};

export const orderStatus = {

  updateOrderStatus: async (orderNumber, data) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/owner/orders/${orderNumber}/update-status/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),

    });

    const result = await response.json();
    return result;
  }
};