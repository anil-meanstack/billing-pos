import Cookies from "js-cookie";
// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_BASE_URL
//     : "/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

export const loginUser = async (loginData) => {
  const res = await fetch(`${API_BASE_URL}/staff/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }
  //  const accessToken = data.token;
  // const refreshToken = data.refresh_token;

  // Save tokens separately if needed
  // localStorage.setItem("accessToken", accessToken);
  // localStorage.setItem("refreshToken", refreshToken);


  return data;
};

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");

  if (!user) return false;

  try {
    const parsed = JSON.parse(user);
    return !!parsed?.accessToken;
  } catch {
    return false;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  // localStorage.removeItem("accessToken");
  // localStorage.removeItem("refreshToken");
};
