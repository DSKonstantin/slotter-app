import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/src/store/redux/reducers";
import { api } from "@/src/store/redux/services/api";

export const store = configureStore({
  reducer: {
    ...rootReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
