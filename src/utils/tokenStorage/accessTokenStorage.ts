import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "access_token";

export const accessTokenStorage = {
  get: () => SecureStore.getItemAsync(ACCESS_KEY),
  set: (token: string) => SecureStore.setItemAsync(ACCESS_KEY, token),
  remove: () => SecureStore.deleteItemAsync(ACCESS_KEY),
};
