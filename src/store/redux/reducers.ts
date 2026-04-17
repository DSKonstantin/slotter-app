import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/src/store/redux/slices/authSlice";
import calendarSlice from "@/src/store/redux/slices/calendarSlice";
import servicesSlice from "@/src/store/redux/slices/servicesSlice";
import uiReducer from "@/src/store/redux/slices/uiSlice";
import slotDraftReducer from "@/src/store/redux/slices/slotDraftSlice";
import clientsReducer from "@/src/store/redux/slices/clientsSlice";
import { api } from "@/src/store/redux/services/api";

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  calendar: calendarSlice,
  services: servicesSlice,
  slotDraft: slotDraftReducer,
  clients: clientsReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
