import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UpdateStatus = "green" | "yellow" | "red";

interface AppVersionState {
  ispe: boolean;
  updateStatus: UpdateStatus;
  storeUrl: string | null;
  updateDismissed: boolean;
}

type AppVersionPayload = Omit<AppVersionState, "updateDismissed">;

const initialState: AppVersionState = {
  ispe: true,
  updateStatus: "green",
  storeUrl: null,
  updateDismissed: false,
};

const appVersionSlice = createSlice({
  name: "appVersion",
  initialState,
  reducers: {
    setAppVersion(state, action: PayloadAction<AppVersionPayload>) {
      state.ispe = action.payload.ispe;
      state.updateStatus = action.payload.updateStatus;
      state.storeUrl = action.payload.storeUrl;
    },
    dismissUpdate(state) {
      state.updateDismissed = true;
    },
  },
});

export const { setAppVersion, dismissUpdate } = appVersionSlice.actions;
export default appVersionSlice.reducer;
