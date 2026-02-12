import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/src/store/redux/reducers";
import { api } from "@/src/store/redux/services/api";
import { attachStoreLogger } from "@/src/utils/dev/devStoreLogger";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

if (__DEV__) {
  // attachStoreLogger(store);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
