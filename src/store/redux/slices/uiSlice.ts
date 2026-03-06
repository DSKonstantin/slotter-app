import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isTabMenuOpen: boolean;
}

const initialState: UiState = {
  isTabMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTabMenuOpen(state, action: PayloadAction<boolean>) {
      state.isTabMenuOpen = action.payload;
    },
  },
});

export const { setTabMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
