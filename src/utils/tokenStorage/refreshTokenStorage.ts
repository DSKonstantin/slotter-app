import * as SecureStore from "expo-secure-store";

const REFRESH_KEY = "refresh_token";

export const refreshTokenStorage = {
  get: () => SecureStore.getItemAsync(REFRESH_KEY),
  set: (token: string) => SecureStore.setItemAsync(REFRESH_KEY, token),
  remove: () => SecureStore.deleteItemAsync(REFRESH_KEY),
};
