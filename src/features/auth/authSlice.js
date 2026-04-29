import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "./authApi";

const savedUser = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: savedUser || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

export const login = createAsyncThunk(
  "auth/login",
  async (loginData, thunkAPI) => {
    try {
      const data = await loginUser(loginData);

      const authData = {
        accessToken: data.token,
        refreshToken: data.refresh_token,
        user: data.user,
        restaurant: data.restaurant,
        currentRestaurant: data.current_restaurant,
        accessibleRestaurants: data.accessible_restaurants,
        permissions: data.permissions,
      };

      localStorage.setItem("user", JSON.stringify(authData));
      return authData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
    },

    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setCurrentRestaurant: (state, action) => {
      if (!state.user) return;
      state.user.currentRestaurant = action.payload;
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const updatedUser = {
        ...storedUser,
        restaurant: action.payload,
        currentRestaurant: action.payload,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      });
  },
});

export const { logout, reset, setCurrentRestaurant } = authSlice.actions;
export default authSlice.reducer;
