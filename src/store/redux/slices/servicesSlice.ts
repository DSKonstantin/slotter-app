import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

    toggleSearchMode(state) {
      state.isSearchMode = !state.isSearchMode;

      if (state.isSearchMode) {
        state.isEditMode = false;
      }
    },

    setEditMode(state, action: PayloadAction<boolean>) {
      state.isEditMode = action.payload;

      if (action.payload) {
        state.isSearchMode = false;
      }
    },

    setSearchMode(state, action: PayloadAction<boolean>) {
      state.isSearchMode = action.payload;

      if (action.payload) {
        state.isEditMode = false;
      }
    },

    resetServicesUi(state) {
      state.isEditMode = false;
      state.isSearchMode = false;
    },
  },
});

export const {
  toggleEditMode,
  toggleSearchMode,
  setEditMode,
  setSearchMode,
  resetServicesUi,
} = servicesSlice.actions;

export default servicesSlice.reducer;
