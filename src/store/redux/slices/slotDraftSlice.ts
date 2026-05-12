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
  createdCustomer?: { id: number; name: string };
  selectedCustomer?: { id: number; name: string };
}

const initialState: SlotDraftState = {
  date: undefined,
  time: undefined,
  services: [],
  additionalServices: [],
  createdCustomer: undefined,
  selectedCustomer: undefined,
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
      state.createdCustomer = undefined;
      state.selectedCustomer = undefined;
    },
    setCreatedCustomer(
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) {
      state.createdCustomer = action.payload;
    },
    clearCreatedCustomer(state) {
      state.createdCustomer = undefined;
    },
    setSelectedCustomer(
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer(state) {
      state.selectedCustomer = undefined;
    },
  },
});

export const {
  setSlotDraft,
  clearSlotDraft,
  setCreatedCustomer,
  clearCreatedCustomer,
  setSelectedCustomer,
  clearSelectedCustomer,
} = slotDraftSlice.actions;
export default slotDraftSlice.reducer;
