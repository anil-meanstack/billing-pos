import {getCartApi} from "../cart/cartApi"


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
const getRestaurantSlug = () => {
    const auth = getAuthData();
    return auth?.currentRestaurant?.slug || auth?.restaurant?.slug || null;
};


export const getDiscounts = async () => {
    const token = getToken();
    const restaurantId = getRestaurantId();

    if (!restaurantId) {
        throw new Error("Restaurant ID not found");
    }

    const res = await fetch(
        `${API_BASE_URL}/discounts/?restaurant_id=${restaurantId}&status=active`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch discounts");
    }

    return res.json();
};

export const applyDiscountApi = async (discountCode) => {
    const restaurantSlug = getRestaurantSlug();
    const token = getToken();

    if (!restaurantSlug) {
        throw new Error("Restaurant not found");
    }

    if (!token) {
        throw new Error("Session expired. Please login again.");
    }

    const response = await fetch(
        `${API_BASE_URL}/public/cart-discount/apply/?restaurant_slug=${restaurantSlug}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
                discount_code: discountCode,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to apply discount");
    }
    return data;
};

export const createDiscount = async (data) => {
    const res = await fetch(`${API_BASE_URL}/discounts/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to create discount");
    }

    return res.json();
};

export const updateDiscount = async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/discounts/${id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return res.json();
};

export const deleteDiscount = async () => {
  const restaurantSlug = getRestaurantSlug();
  const token = getToken();
  if (!restaurantSlug) {
    throw new Error("Restaurant not found");
  }

  const res = await fetch(
    `${API_BASE_URL}/public/cart-discount/remove/`,
    {
      method: "POST",
      headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                restaurant_slug: restaurantSlug,
            }),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to remove discount");
  }

  return res.json();
};