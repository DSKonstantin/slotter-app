require("react-native-gesture-handler/jestSetup");

// store.ts wires redux-persist through AsyncStorage at import time (even for
// slices that don't persist), so anything importing the store singleton
// needs the native module mocked — official mock from the package itself.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
