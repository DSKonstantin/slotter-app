import { configureStore, type StoreEnhancer } from "@reduxjs/toolkit";
import rootReducer from "@/src/store/redux/reducers";
import { api } from "@/src/store/redux/services/api";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const devEnhancers: StoreEnhancer[] = [];
if (__DEV__) {
  const reactotron =
    require("@/src/services/reactotron").default as { createEnhancer?: () => StoreEnhancer };
  if (reactotron.createEnhancer) devEnhancers.push(reactotron.createEnhancer());
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  enhancers: (getDefault) => getDefault().concat(devEnhancers),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
