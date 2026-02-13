import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/src/store/redux/slices/authSlice";
import calendarSlice from "@/src/store/redux/slices/calendarSlice";
import { api } from "@/src/store/redux/services/api";

const rootReducer = combineReducers({
  auth: authReducer,
  calendar: calendarSlice,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
