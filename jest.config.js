const EXTRA_ESM_PACKAGES = [
  "immer",
  "react-redux",
  "redux-persist",
  "reselect",
];

module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    `/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|${EXTRA_ESM_PACKAGES.join("|")}))`,
    "/node_modules/react-native-reanimated/plugin/",
  ],
  setupFiles: ["./jest.setup.js"],
};
