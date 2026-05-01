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
      .addCase(loadTablesFromApi.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(loadTablesFromApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { setTableStatus, resetTable, } = tableSlice.actions;

export default tableSlice.reducer;
