const loadGetAppVersion = ({
  native,
  config,
}: {
  native: string | null;
  config?: string;
}) => {
  jest.doMock("expo-application", () => ({
    nativeApplicationVersion: native,
  }));
  jest.doMock("expo-constants", () => ({
    __esModule: true,
    default: { expoConfig: config === undefined ? null : { version: config } },
  }));

  let getAppVersion!: typeof import("@/src/utils/appVersion").getAppVersion;
  jest.isolateModules(() => {
    getAppVersion = require("@/src/utils/appVersion").getAppVersion;
  });
  return getAppVersion;
};

describe("getAppVersion", () => {
  it("prefers the native version of the installed build", () => {
    expect(loadGetAppVersion({ native: "1.0.10", config: "9.9.9" })()).toBe(
      "1.0.10",
    );
  });

  it("falls back to the version from the app config", () => {
    expect(loadGetAppVersion({ native: null, config: "1.0.9" })()).toBe(
      "1.0.9",
    );
  });

  it("falls back to dev when nothing is known", () => {
    expect(loadGetAppVersion({ native: null })()).toBe("dev");
  });
});
