import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type EditModeType = "categories" | "services";

type ServicesState = {
  isEditMode: boolean;
  editModeType: EditModeType;
  isSearchMode: boolean;
};

const initialState: ServicesState = {
  isEditMode: false,
  editModeType: "categories",
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
      } else {
        state.editModeType = "categories";
      }
    },
    setEditModeType(state, action: PayloadAction<EditModeType>) {
      state.editModeType = action.payload;
    },
  },
});

export const { toggleEditMode, setEditModeType } = servicesSlice.actions;

export default servicesSlice.reducer;
