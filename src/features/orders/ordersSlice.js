import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ordersApi, getAllOrderHistory, viewOrder } from "./ordersApi";

export const checkoutOrder = createAsyncThunk(
  "orders/checkoutOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      return await ordersApi.checkoutOrder(orderData);
    } catch (error) {
      return rejectWithValue(error?.message || "Checkout Failed");
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await ordersApi.fetchOrders();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const viewOrderDetails = createAsyncThunk(
  "orders/viewOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      return await viewOrder.viewOrderDetails(orderId);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch order details");
    }
  },
);

export const fetchOrderHistory = createAsyncThunk(
  "orders/fetchOrderHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllOrderHistory.fetchOrderHistory();
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch order history");
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await ordersApi.updateOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",

  initialState: {
    orders: [],
    cart: [],
    loading: false,
    error: null,
    currentOrder: null,
    checkoutSuccess: false,
  },

  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    resetCheckout: (state) => {
      state.checkoutSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })

      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(checkoutOrder.pending, (state) => {
        state.loading = true;
        state.checkoutSuccess = false;
      })

      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutSuccess = true;

        state.orders.unshift(action.payload);

        state.currentOrder = action.payload;
      })

      .addCase(checkoutOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= STATUS ================= */
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;

        const order = state.orders.find((o) => o.id === orderId);

        if (order) {
          order.status = status;
        }

        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = status;
        }
      })

      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })

      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(viewOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order || action.payload;
      })
      .addCase(viewOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentOrder, clearCurrentOrder, resetCheckout } =
  ordersSlice.actions;

export default ordersSlice.reducer;
