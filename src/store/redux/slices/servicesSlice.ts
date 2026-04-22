import { createSlice } from "@reduxjs/toolkit";

type ServicesState = {
  isEditMode: boolean;
  isSearchMode: boolean;
};

const initialState: ServicesState = {
  isEditMode: false,
  isSearchMode: false,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    toggleEditMode(state) {
      state.isEditMode = !state.isEditMode;

      if (state.isEditMode) {
        state.isSearchMode = false;
      }
    },

  },
});

export const { toggleEditMode } = servicesSlice.actions;

export default servicesSlice.reducer;
