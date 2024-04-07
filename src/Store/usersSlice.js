import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    usersData: [],
  },
  reducers: {
    setUsersData: (state, action) => {
      state.usersData = action.payload;
    },
    clearUsersData: (state) => {
      state.usersData = null;
    },
  },
});

export const { setUsersData, clearUsersData } = usersSlice.actions;

export default usersSlice.reducer;
