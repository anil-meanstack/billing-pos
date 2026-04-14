// features/staff/staffSlice.js
import { createSlice } from "@reduxjs/toolkit";

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    list: [],
  },
  reducers: {
    setStaff: (state, action) => {
      state.list = action.payload;
    },
  },
});

export const { setStaff } = staffSlice.actions;
export default staffSlice.reducer;