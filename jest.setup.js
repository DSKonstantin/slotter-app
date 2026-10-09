require("react-native-gesture-handler/jestSetup");

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@appmetrica/react-native-analytics", () => ({
  __esModule: true,
  default: {
    activate: jest.fn(),
    reportEvent: jest.fn(),
    reportError: jest.fn(),
    reportUserProfile: jest.fn(),
    setUserProfileID: jest.fn(),
  },
  ...jest.requireActual(
    "@appmetrica/react-native-analytics/lib/commonjs/public/userProfile",
  ),
}));
