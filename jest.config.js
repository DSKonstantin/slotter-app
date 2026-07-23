// jest-expo's default transformIgnorePatterns (react-native/@react-native/expo/etc.)
// doesn't cover a few Redux Toolkit dependencies whose package.json "exports"
// map points the "react-native" condition (which RN's jest test environment
// requests, see react-native/jest/react-native-env.js) at an untransformed
// ESM build — importing them then blows up with "Unexpected token export".
// Extending the pattern (not replacing it — replacing it drops jest-expo's
// own required entries like expo-modules-core) tells Jest to transform them
// like first-party RN code instead of skipping them as plain node_modules.
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
