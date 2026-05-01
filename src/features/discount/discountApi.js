
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

export const applyDiscountApi = async (res) => {
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

            body: JSON.stringify(res),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Failed to apply discount");
    }
    return data;
};

export const dineApplyDiscountApi = async (res) => {
    const restaurantSlug = getRestaurantSlug();
    const token = getToken();

    if (!restaurantSlug) {
        throw new Error("Restaurant not found");
    }

    if (!token) {
        throw new Error("Session expired. Please login again.");
    }

    const response = await fetch(
        `${API_BASE_URL}/owner/restaurants/${restaurantSlug}/orders/dine-in/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(res),
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

export const deleteDiscount = async (payload = {}) => {
    const restaurantSlug = getRestaurantSlug();
    const token = getToken();

    if (!restaurantSlug) {
        throw new Error("Restaurant not found");
    }

    const res = await fetch(
        `${API_BASE_URL}/public/cart-discount/remove/?restaurant_slug=${restaurantSlug}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload), 
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Failed to remove discount");
    }

    return data;
};