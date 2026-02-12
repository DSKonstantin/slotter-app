import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/src/store/redux/slices/authSlice";
import { api } from "@/src/store/redux/services/api";

const rootReducer = combineReducers({
  auth: authReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
