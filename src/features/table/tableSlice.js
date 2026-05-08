import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTablesApi } from "./tableApi";

export const loadTablesFromApi = createAsyncThunk(
  "tables/loadFromApi",
  async () => {
    return await fetchTablesApi();
  }
);


const tableSlice = createSlice({
  name: "tables",

  initialState: {
    list: [],
    loading: false,
    error: null,
  },

  reducers: {
    setTableStatus: (state, action) => {
      const { id, status, amount, orderId } = action.payload;

      const table = state.list.find((t) => t.id === id);

      if (table) {
        table.status = status;
        table.amount = amount ?? 0;
        table.orderId = orderId ?? null;
      }
    },

    resetTable: (state, action) => {
      const id = action.payload;

      const table = state.list.find((t) => t.id === id);

      if (table) {
        table.status = "available";
        table.amount = 0;
        table.orderId = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadTablesFromApi.pending, (state) => {
        state.loading = true;
      })
      // .addCase(loadTablesFromApi.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.list = action.payload;
      // })
      .addCase(loadTablesFromApi.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;

      state.list = action.payload.map((t) => ({
        ...t,
        tableNumber: t.table_number || t.tableNumber,
        cart_item_count: Number(t.cart_item_count || 0),
        cart_subtotal: Number(t.cart_subtotal || 0),
        has_active_cart: Boolean(t.has_active_cart),
        has_active_order: Boolean(t.has_active_order),
      }));
    })
      .addCase(loadTablesFromApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { setTableStatus, resetTable, } = tableSlice.actions;

export default tableSlice.reducer;
