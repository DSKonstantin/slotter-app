const flushPromises = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

const loadService = ({
  apiKey,
  dev = false,
  version = "1.0.10",
  build = "42",
  storedKeys = [],
  storageError,
}: {
  apiKey?: string;
  dev?: boolean;
  version?: string | null;
  build?: string | null;
  storedKeys?: string[];
  storageError?: Error;
}) => {
  const getAllKeys = storageError
    ? jest.fn().mockRejectedValue(storageError)
    : jest.fn().mockResolvedValue(storedKeys);
  jest.doMock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: { getAllKeys },
  }));
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

  return { service, sdk, getAllKeys };
};

const loadActivated = async (options: Parameters<typeof loadService>[0]) => {
  const loaded = loadService(options);
  await flushPromises();
  return loaded;
};

describe("appMetrica service — release build with a key", () => {
  it("activates the SDK once with the key and a 2 minute session timeout", async () => {
    const { sdk } = await loadActivated({ apiKey: "test-key" });

    expect(sdk.activate).toHaveBeenCalledTimes(1);
    expect(sdk.activate).toHaveBeenCalledWith({
      apiKey: "test-key",
      sessionTimeout: 120,
      logs: false,
      crashReporting: false,
      nativeCrashReporting: false,
      activationAsSessionStart: true,
      firstActivationAsUpdate: false,
      appVersion: "1.0.10",
      appBuildNumber: 42,
    });
  });

  it("turns the SDK's own crash reporting off so Sentry stays the only crash handler", async () => {
    const { sdk } = await loadActivated({ apiKey: "test-key" });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({
        crashReporting: false,
        nativeCrashReporting: false,
      }),
    );
  });

  it("starts the first session on activation because the SDK is activated after the app became active", async () => {
    const { sdk } = await loadActivated({ apiKey: "test-key" });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ activationAsSessionStart: true }),
    );
  });

  it("passes the native version and build number to the SDK", async () => {
    const { sdk } = await loadActivated({
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
  ])("leaves the build number out when it is %s", async (_label, build) => {
    const { sdk } = await loadActivated({ apiKey: "test-key", build });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ appBuildNumber: undefined }),
    );
  });

  it("leaves the version out when the native one is unknown", async () => {
    const { sdk } = await loadActivated({ apiKey: "test-key", version: null });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ appVersion: undefined }),
    );
  });

  it("reports events with their parameters", async () => {
    const { service, sdk } = await loadActivated({ apiKey: "test-key" });

    service.reportEvent("login");
    service.reportEvent("appointment_created", { id: 7 });
    await flushPromises();

    expect(sdk.reportEvent).toHaveBeenNthCalledWith(1, "login", undefined);
    expect(sdk.reportEvent).toHaveBeenNthCalledWith(2, "appointment_created", {
      id: 7,
    });
  });

  it("sets the user profile id as a string and clears it on logout", async () => {
    const { service, sdk } = await loadActivated({ apiKey: "test-key" });

    service.setUserProfileId(42);
    service.setUserProfileId(null);
    await flushPromises();

    expect(sdk.setUserProfileID).toHaveBeenNthCalledWith(1, "42");
    expect(sdk.setUserProfileID).toHaveBeenNthCalledWith(2, undefined);
  });
});

describe("appMetrica service — first activation", () => {
  it("counts it as an update when the app already stored data before the SDK", async () => {
    const { sdk, getAllKeys } = await loadActivated({
      apiKey: "test-key",
      storedKeys: ["language", "persist:auth"],
    });

    expect(getAllKeys).toHaveBeenCalledTimes(1);
    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ firstActivationAsUpdate: true }),
    );
  });

  it("counts it as an install when the app has no stored data yet", async () => {
    const { sdk } = await loadActivated({ apiKey: "test-key", storedKeys: [] });

    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ firstActivationAsUpdate: false }),
    );
  });

  it("counts it as an install and still activates when storage cannot be read", async () => {
    const { sdk } = await loadActivated({
      apiKey: "test-key",
      storageError: new Error("storage unavailable"),
    });

    expect(sdk.activate).toHaveBeenCalledTimes(1);
    expect(sdk.activate).toHaveBeenCalledWith(
      expect.objectContaining({ firstActivationAsUpdate: false }),
    );
  });
});

describe("appMetrica service — before the SDK is activated", () => {
  it("holds events and the profile id, then sends them in order after activation", async () => {
    const { service, sdk } = loadService({ apiKey: "test-key" });

    service.reportEvent("login");
    service.setUserProfileId(42);
    service.reportEvent("appointment_created", { id: 7 });

    expect(sdk.activate).not.toHaveBeenCalled();
    expect(sdk.reportEvent).not.toHaveBeenCalled();
    expect(sdk.setUserProfileID).not.toHaveBeenCalled();

    await flushPromises();

    expect(sdk.activate).toHaveBeenCalledTimes(1);
    expect(sdk.reportEvent).toHaveBeenNthCalledWith(1, "login", undefined);
    expect(sdk.setUserProfileID).toHaveBeenCalledWith("42");
    expect(sdk.reportEvent).toHaveBeenNthCalledWith(2, "appointment_created", {
      id: 7,
    });

    const [activated] = jest.mocked(sdk.activate).mock.invocationCallOrder;
    const [firstEvent, secondEvent] = jest.mocked(sdk.reportEvent).mock
      .invocationCallOrder;
    const [profile] = jest.mocked(sdk.setUserProfileID).mock
      .invocationCallOrder;
    expect(activated).toBeLessThan(firstEvent);
    expect(firstEvent).toBeLessThan(profile);
    expect(profile).toBeLessThan(secondEvent);
  });
});

const sentAttributes = (sdk: { reportUserProfile: unknown }) =>
  jest
    .mocked(sdk.reportUserProfile as (profile: unknown) => void)
    .mock.calls.map(
      ([profile]) => (profile as { attributes: unknown[] }).attributes,
    );

describe("appMetrica service — profile attributes", () => {
  it("sends typed attributes as a single profile update", async () => {
    const { service, sdk } = await loadActivated({ apiKey: "test-key" });

    service.setProfileAttributes([
      { type: "string", key: "direct_telegram_status", value: "active" },
      { type: "number", key: "direct_telegram_days_left", value: 12 },
      { type: "boolean", key: "direct_has_problem", value: false },
    ]);
    await flushPromises();

    expect(sentAttributes(sdk)).toEqual([
      [
        {
          type: "StringValue",
          key: "direct_telegram_status",
          value: "active",
          ifUndefined: false,
        },
        {
          type: "NumberValue",
          key: "direct_telegram_days_left",
          value: 12,
          ifUndefined: false,
        },
        {
          type: "BooleanValue",
          key: "direct_has_problem",
          value: false,
          ifUndefined: false,
        },
      ],
    ]);
  });

  it("resets an attribute of any type when its value is null", async () => {
    const { service, sdk } = await loadActivated({ apiKey: "test-key" });

    service.setProfileAttributes([
      { type: "string", key: "a", value: null },
      { type: "number", key: "b", value: null },
      { type: "boolean", key: "c", value: null },
    ]);
    await flushPromises();

    expect(sentAttributes(sdk)).toEqual([
      [
        { type: "StringValueReset", key: "a" },
        { type: "NumberValueReset", key: "b" },
        { type: "BooleanValueReset", key: "c" },
      ],
    ]);
  });

  it("sends nothing for an empty list", async () => {
    const { service, sdk } = await loadActivated({ apiKey: "test-key" });

    service.setProfileAttributes([]);
    await flushPromises();

    expect(sdk.reportUserProfile).not.toHaveBeenCalled();
  });

  it("waits for activation and keeps the order after the profile id", async () => {
    const { service, sdk } = loadService({ apiKey: "test-key" });

    service.setUserProfileId(42);
    service.setProfileAttributes([
      { type: "boolean", key: "direct_has_problem", value: true },
    ]);

    expect(sdk.reportUserProfile).not.toHaveBeenCalled();

    await flushPromises();

    const [activated] = jest.mocked(sdk.activate).mock.invocationCallOrder;
    const [profileId] = jest.mocked(sdk.setUserProfileID).mock
      .invocationCallOrder;
    const [attributes] = jest.mocked(sdk.reportUserProfile).mock
      .invocationCallOrder;
    expect(activated).toBeLessThan(profileId);
    expect(profileId).toBeLessThan(attributes);
  });
});

describe("appMetrica service — development build", () => {
  it("does not activate the SDK even with a key", async () => {
    const { sdk, getAllKeys } = await loadActivated({
      apiKey: "test-key",
      dev: true,
    });

    expect(sdk.activate).not.toHaveBeenCalled();
    expect(getAllKeys).not.toHaveBeenCalled();
  });

  it("does not send events or the user profile", async () => {
    const { service, sdk } = await loadActivated({
      apiKey: "test-key",
      dev: true,
    });

    service.reportEvent("login", { method: "password" });
    service.setUserProfileId(42);
    service.setProfileAttributes([
      { type: "boolean", key: "direct_has_problem", value: true },
    ]);
    await flushPromises();

    expect(sdk.reportEvent).not.toHaveBeenCalled();
    expect(sdk.setUserProfileID).not.toHaveBeenCalled();
    expect(sdk.reportUserProfile).not.toHaveBeenCalled();
  });
});

describe("appMetrica service — without a key", () => {
  it("does not activate the SDK", async () => {
    const { sdk, getAllKeys } = await loadActivated({});

    expect(sdk.activate).not.toHaveBeenCalled();
    expect(getAllKeys).not.toHaveBeenCalled();
  });

  it("does not report events or set the profile", async () => {
    const { service, sdk } = await loadActivated({});

    service.reportEvent("login");
    service.setUserProfileId(42);
    service.setProfileAttributes([
      { type: "boolean", key: "direct_has_problem", value: true },
    ]);
    await flushPromises();

    expect(sdk.reportEvent).not.toHaveBeenCalled();
    expect(sdk.setUserProfileID).not.toHaveBeenCalled();
    expect(sdk.reportUserProfile).not.toHaveBeenCalled();
  });

  it("treats an empty key as missing", async () => {
    const { sdk } = await loadActivated({ apiKey: "" });

    expect(sdk.activate).not.toHaveBeenCalled();
  });
});
