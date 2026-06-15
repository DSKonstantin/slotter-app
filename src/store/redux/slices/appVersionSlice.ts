import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UpdateStatus = "green" | "yellow" | "red";

interface AppVersionState {
  ispe: boolean;
  updateStatus: UpdateStatus;
  storeUrl: string | null;
}

const initialState: AppVersionState = {
  ispe: true,
  updateStatus: "green",
  storeUrl: null,
};

const appVersionSlice = createSlice({
  name: "appVersion",
  initialState,
  reducers: {
    setAppVersion(state, action: PayloadAction<AppVersionState>) {
      state.ispe = action.payload.ispe;
      state.updateStatus = action.payload.updateStatus;
      state.storeUrl = action.payload.storeUrl;
    },
  },
});

export const { setAppVersion } = appVersionSlice.actions;
export default appVersionSlice.reducer;
