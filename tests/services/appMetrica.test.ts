const loadService = ({
  apiKey,
  dev = false,
  version = "1.0.10",
  build = "42",
}: {
  apiKey?: string;
  dev?: boolean;
  version?: string | null;
  build?: string | null;
}) => {
  jest.doMock("expo-application", () => ({
    nativeApplicationVersion: version,
    nativeBuildVersion: build,
  }));
  const previousKey = process.env.EXPO_PUBLIC_APPMETRICA_API_KEY;
  const previousDev = (global as { __DEV__?: boolean }).__DEV__;
  if (apiKey === undefined) delete process.env.EXPO_PUBLIC_APPMETRICA_API_KEY;
  else process.env.EXPO_PUBLIC_APPMETRICA_API_KEY = apiKey;
  (global as { __DEV__?: boolean }).__DEV__ = dev;

  let service!: typeof import("@/src/services/appMetrica");
  let sdk!: typeof import("@appmetrica/react-native-analytics").default;
  jest.isolateModules(() => {
    sdk = require("@appmetrica/react-native-analytics").default;
    service = require("@/src/services/appMetrica");
  });

  if (previousKey === undefined)
    delete process.env.EXPO_PUBLIC_APPMETRICA_API_KEY;
  else process.env.EXPO_PUBLIC_APPMETRICA_API_KEY = previousKey;
  (global as { __DEV__?: boolean }).__DEV__ = previousDev;

  return { service, sdk };
};

describe("appMetrica service — release build with a key", () => {
  it("activates the SDK once with the key and a 2 minute session timeout", () => {
    const { sdk } = loadService({ apiKey: "test-key" });

    expect(sdk.activate).toHaveBeenCalledTimes(1);
    expect(sdk.activate).toHaveBeenCalledWith({
      apiKey: "test-key",
      sessionTimeout: 120,
      logs: false,
      appVersion: "1.0.10",
      appBuildNumber: 42,
    });
  });

  it("passes the native version and build number to the SDK", () => {
    const { sdk } = loadService({
      apiKey: "test-key",
      version: "2.3.4",
      build: "117",
    });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ appVersion: "2.3.4", appBuildNumber: 117 }),
    );
  });

  it.each([
    ["null", null],
    ["empty", ""],
    ["not a number", "abc"],
    ["zero", "0"],
    ["negative", "-3"],
    ["fractional", "1.5"],
  ])("leaves the build number out when it is %s", (_label, build) => {
    const { sdk } = loadService({ apiKey: "test-key", build });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ appBuildNumber: undefined }),
    );
  });

  it("leaves the version out when the native one is unknown", () => {
    const { sdk } = loadService({ apiKey: "test-key", version: null });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ appVersion: undefined }),
    );
  });

  it("reports events with their parameters", () => {
    const { service, sdk } = loadService({ apiKey: "test-key" });

    service.reportEvent("login");
    service.reportEvent("appointment_created", { id: 7 });

    expect(sdk.reportEvent).toHaveBeenNthCalledWith(1, "login", undefined);
    expect(sdk.reportEvent).toHaveBeenNthCalledWith(2, "appointment_created", {
      id: 7,
    });
  });

  it("sets the user profile id as a string and clears it on logout", () => {
    const { service, sdk } = loadService({ apiKey: "test-key" });

    service.setUserProfileId(42);
    service.setUserProfileId(null);

    expect(sdk.setUserProfileID).toHaveBeenNthCalledWith(1, "42");
    expect(sdk.setUserProfileID).toHaveBeenNthCalledWith(2, undefined);
  });
});

describe("appMetrica service — development build", () => {
  it("does not activate the SDK even with a key", () => {
    const { sdk } = loadService({ apiKey: "test-key", dev: true });

    expect(sdk.activate).not.toHaveBeenCalled();
  });

  it("does not send events or the user profile", () => {
    const { service, sdk } = loadService({ apiKey: "test-key", dev: true });

    service.reportEvent("login", { method: "password" });
    service.setUserProfileId(42);

    expect(sdk.reportEvent).not.toHaveBeenCalled();
    expect(sdk.setUserProfileID).not.toHaveBeenCalled();
  });
});

describe("appMetrica service — without a key", () => {
  it("does not activate the SDK", () => {
    const { sdk } = loadService({});

    expect(sdk.activate).not.toHaveBeenCalled();
  });

  it("does not report events or set the profile", () => {
    const { service, sdk } = loadService({});

    service.reportEvent("login");
    service.setUserProfileId(42);

    expect(sdk.reportEvent).not.toHaveBeenCalled();
    expect(sdk.setUserProfileID).not.toHaveBeenCalled();
  });

  it("treats an empty key as missing", () => {
    const { sdk } = loadService({ apiKey: "" });

    expect(sdk.activate).not.toHaveBeenCalled();
  });
});
