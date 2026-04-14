import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  newCount: 0,
  preparingCount: 0,
  readyCount: 0,
};

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    setKitchenCounts: (state, action) => {
      state.newCount = action.payload.new;
      state.preparingCount = action.payload.preparing;
      state.readyCount = action.payload.ready;
    },
  },
});

export const { setKitchenCounts } = kitchenSlice.actions;
export default kitchenSlice.reducer;