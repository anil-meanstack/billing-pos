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
const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null;
};
const getRestaurantId = () => {
  const auth = getAuthData();
  return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
};

export const getKitchenTickets = async (status) => {
  const token = getToken();
  const restaurantId = getRestaurantId();

  if (!restaurantId) {
    throw new Error("Restaurant ID not found");
  }

  const res = await fetch(
    `${API_BASE_URL}/kitchen-tickets/?status=${status}&restaurant_id=${restaurantId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // "x-restaurant-id": restaurantId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch kitchen tickets");
  }
  const data =res.json()
  return data;
};

export const getKitchenTicketById = async (id) => {
  const token = getToken();
  const restaurantId = getRestaurantId();

  if (!restaurantId) {
    throw new Error("Restaurant ID not found");
  }

  const res = await fetch(
    `${API_BASE_URL}/kitchen-tickets/${id}/?restaurant_id=${restaurantId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // "X-Restaurant-ID": restaurantId,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch kitchen ticket details");
  }

  return res.json();
};

export const TicketStatus = {

  updateTicketStatus: async (ticketId, data) => {
    const token = getToken();
    const restaurantId = getRestaurantId();

    if (!restaurantId) {
      throw new Error("Restaurant ID not found");
    }
    const response = await fetch(`${API_BASE_URL}/kitchen-tickets/${ticketId}/update_status/?restaurant_id=${restaurantId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // "X-Restaurant-ID": restaurantId,
      },
      body: JSON.stringify(data),

    });

    const result = await response.json();
    return result;
  }
};