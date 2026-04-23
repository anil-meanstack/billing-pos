import getCsrfToken from "../../utils/csrf";

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


export const addToCartItem = async (orderData) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const payload = {
    ...orderData
  };

  const response = await fetch(`${API_BASE_URL}/${userType}/cart/${slug}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });

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
};

export const updateCartItemApi = async (itemId, res) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const response = await fetch(
    `${API_BASE_URL}/${userType}/cart/${slug}/items/${itemId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(res),
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
}
export const getCartApi = async (res) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const params = new URLSearchParams();

  if (res?.order_type) {
    params.append("order_type", res.order_type);
  }

  if (res?.order_type === "dine_in" && res?.table_id) {
    params.append("table_id", res.table_id);
  }

  const url = `${API_BASE_URL}/${userType}/cart/${slug}/?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Fetch cart failed");
  }

  return await response.json();
};
export const removeCartItemApi = async (itemId, res) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const response = await fetch(
    `${API_BASE_URL}/${userType}/cart/${slug}/items/${itemId}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(res)
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
}

export const tableSelectable = async (res) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const response = await fetch(
    `${API_BASE_URL}/${userType}/cart/${slug}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(res),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data?.message || "Table update failed");
    } catch {
      throw new Error(`Server error: ${response.status}`);
    }
  }

  return await response.json();
};

export const clearCartApi = async () => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

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
};

export const addComboApi = async (res) => {
  const slug = getRestaurantSlug();
  const token = getToken();
  const userType = getUserType();

  const response = await fetch(
    `${API_BASE_URL}/${userType}/cart/${slug}/add-combo/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify(res),
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
};