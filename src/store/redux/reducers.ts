import { combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import authReducer from "@/src/store/redux/slices/authSlice";
import uiReducer from "@/src/store/redux/slices/uiSlice";
import { api } from "@/src/store/redux/services/api";

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  version: 1,
  whitelist: ["user", "resourceType"],
};

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
