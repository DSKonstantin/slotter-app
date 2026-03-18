import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  AdditionalService,
  Service,
} from "@/src/store/redux/services/api-types";

interface SlotDraftState {
  date?: string;
  time?: string;
  services: Service[];
  additionalServices: AdditionalService[];
}

const initialState: SlotDraftState = {
  date: undefined,
  time: undefined,
  services: [],
  additionalServices: [],
};

const slotDraftSlice = createSlice({
  name: "slotDraft",
  initialState,
  reducers: {
    setSlotDraft(
      state,
      action: PayloadAction<{
        date?: string;
        time?: string;
        services: Service[];
        additionalServices: AdditionalService[];
      }>,
    ) {
      state.date = action.payload.date;
      state.time = action.payload.time;
      state.services = action.payload.services;
      state.additionalServices = action.payload.additionalServices;
    },
    clearSlotDraft(state) {
      state.date = undefined;
      state.time = undefined;
      state.services = [];
      state.additionalServices = [];
    },
  },
});

export const { setSlotDraft, clearSlotDraft } = slotDraftSlice.actions;
export default slotDraftSlice.reducer;
