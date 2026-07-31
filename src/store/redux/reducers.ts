import { combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTransform, persistReducer } from "redux-persist";
import authReducer, {
  type AuthState,
} from "@/src/store/redux/slices/authSlice";
import calendarSlice from "@/src/store/redux/slices/calendarSlice";
import servicesSlice from "@/src/store/redux/slices/servicesSlice";
import uiReducer from "@/src/store/redux/slices/uiSlice";
import appVersionReducer from "@/src/store/redux/slices/appVersionSlice";
import slotDraftReducer from "@/src/store/redux/slices/slotDraftSlice";
import clientsReducer from "@/src/store/redux/slices/clientsSlice";
import { api } from "@/src/store/redux/services/api";

// Persist only the minimum needed to render the app before `getMe` resolves on
// bootstrap (see AuthContext.runBootstrap) — the rest of `user` (phone, ФИО,
// subscription_membership/payment metadata, etc.) must not sit in plaintext
// AsyncStorage. Full user is re-fetched from the API on every app start.
type PersistedAuthUser = Pick<
  NonNullable<AuthState["user"]>,
  "id" | "onboarding_step"
> | null;

const authUserTransform = createTransform<AuthState["user"], PersistedAuthUser>(
  (user) =>
    user
      ? {
          id: user.id,
          onboarding_step: user.onboarding_step,
        }
      : null,
  // Rehydrated state is intentionally incomplete until `getMe` overwrites it
  // (app/_layout.tsx blocks rendering on `isLoading` until then).
  (user) => user as AuthState["user"],
  { whitelist: ["user"] },
);

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  version: 1,
  whitelist: ["user", "resourceType"],
  transforms: [authUserTransform],
};

const rootReducer = combineReducers({
  ui: uiReducer,
  appVersion: appVersionReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  calendar: calendarSlice,
  services: servicesSlice,
  slotDraft: slotDraftReducer,
  clients: clientsReducer,
  [api.reducerPath]: api.reducer,
});

export default rootReducer;
