import getCsrfToken from "../../utils/csrf";

// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_BASE_URL
//     : "/api";

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

const getRestaurantSlug = () => {
  const auth = getAuthData();
  return auth?.currentRestaurant?.slug || auth?.restaurant?.slug || null;
};

const getRestaurantId = () => {
  const auth = getAuthData();
  return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
};

const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null; 
};


export const ordersApi = {
  checkoutOrder: async (checkoutData) => {
    const restaurantId = getRestaurantId();
    const token = getToken();
    const slug = getRestaurantSlug();

    if (!restaurantId) {
      throw new Error("Restaurant ID not found. Please login again.");
    }

    if (!token) {
      throw new Error("User not logged in. Token missing.");
    }

    if (!slug) {
      throw new Error("Restaurant slug not found.");
    }

    const payload = {
      ...checkoutData,
      restaurant_id: restaurantId,
    };

    const response = await fetch(
      `${API_BASE_URL}/restaurant/${slug}/cart/checkout/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Added
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Checkout failed");
    }

    return data;
  },


  fetchOrders: async () => {
    const localOrders = localStorage.getItem("restaurantOrders");

    return localOrders ? JSON.parse(localOrders) : [];
  },


  updateOrderStatus: async (orderId, status) => {
    const localOrders =
      JSON.parse(localStorage.getItem("restaurantOrders")) || [];

    const index = localOrders.findIndex((o) => o.id === orderId);

    if (index !== -1) {
      localOrders[index].status = status;

      localStorage.setItem("restaurantOrders", JSON.stringify(localOrders));
    }

    return { orderId, status };
  },
};

export const getAllOrderHistory = {
  fetchOrderHistory: async () => {
    const token = getToken();
    const restaurantId = getRestaurantId();

    if (!token) {
      throw new Error("User not logged in. Token missing.");
    }


    const response = await fetch(`${API_BASE_URL}/orders/?restaurant_id=${restaurantId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch order history");
    }

    return data;
  },
};


export const viewOrder = {
  viewOrderDetails: async (orderId) => {
    const token = getToken();
    const restaurantId = getRestaurantId();

    if (!token) {
      throw new Error("User not logged in. Token missing.");
    }

    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/?restaurant_id=${restaurantId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch order details");
    }

    return data;
  },
};