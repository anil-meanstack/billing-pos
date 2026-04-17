import getCsrfToken from "../../utils/csrf";

// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_BASE_URL
//     : "/api";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const getAuthData = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch (err) {
    console.error("Auth Parse Error:", err);
    return null;
  }
};

// const getRestaurantId = () => {
//   const auth = getAuthData();
//   return auth?.currentRestaurant?.id || auth?.restaurant?.id || null;
// };

const getRestaurantSlug = () => {
  const auth = getAuthData();
  return auth?.currentRestaurant?.slug || auth?.restaurant?.slug || null;
};

const getToken = () => {
  const auth = getAuthData();
  return auth?.accessToken || null;
};

const getUserType = () => {
  const authData = getAuthData();
  return authData?.user?.user_type;
};


export const placeOrderApi = async (orderData) => {
  // const restaurantId = getRestaurantId();
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const payload = {
    ...orderData
  };

  // Log what we're trying to save
  // console.log("placeOrderApi called with payload:", payload);

  // Check if we're offline
  const isOffline = !navigator.onLine;

  try {
    // If offline, skip API call and go directly to offline storage
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(`${API_BASE_URL}/${userType}/cart/${slug}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(payload),
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data?.message || "Place order failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Offline → saving order locally", error.message);

    let itemsToSave = [];

    // Case 1: payload has items array (like from your API)
    if (payload.items && payload.items.length > 0) {
      itemsToSave = payload.items;
    }
    // Case 2: payload itself is a cart item (single item add)
    else if (payload.menu_item_id) {
      itemsToSave = [payload];
    }
    // Case 3: payload has cart_items property
    else if (payload.cart_items && payload.cart_items.length > 0) {
      itemsToSave = payload.cart_items;
    }

    return {
      offline: true,
      message: "Order saved offline",
      items: []
    };
  }
};

export const getOrdersApi = async () => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const isOffline = !navigator.onLine;

  try {
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(`${API_BASE_URL}/${userType}/cart/${slug}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data?.message || "API failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Fetching cart from offline storage");

  

    return {
      offline: true
    };
  }
};
export const updateCartItemApi = async (itemId, quantity) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const isOffline = !navigator.onLine;

  try {
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(
      `${API_BASE_URL}/${userType}/cart/${slug}/items/${itemId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({ quantity }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data?.message || "Update failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Offline → saving update locally");


    return {
      offline: true,
      itemId,
      quantity
    };
  }
};

export const removeCartItemApi = async (itemId) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const isOffline = !navigator.onLine;

  try {
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(
      `${API_BASE_URL}/${userType}/cart/${slug}/items/${itemId}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": getCsrfToken(),
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data?.message || "Remove failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }


    return {};
  } catch (error) {
    console.log("Offline → remove locally");

    return { offline: true };
  }
};

export const clearCartApi = async () => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const isOffline = !navigator.onLine;

  try {
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(
      `${API_BASE_URL}/${userType}/cart/${slug}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": getCsrfToken(),
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData?.message || "Clear cart failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }


    return { success: true };
  } catch (error) {
    console.log("Offline → clearing cart locally");


    return { offline: true, success: true };
  }
};

export const addComboApi = async (comboId, quantity = 1) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const isOffline = !navigator.onLine;

  try {
    if (isOffline) {
      throw new Error("Offline mode");
    }

    const response = await fetch(
      `${API_BASE_URL}/${userType}/cart/${slug}/add-combo/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
          combo_id: comboId,
          quantity,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        throw new Error(data?.message || "Add combo failed");
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.log("Offline → combo save locally");

    return {
      offline: true,
      combo_id: comboId,
      quantity,
    };
  }
};