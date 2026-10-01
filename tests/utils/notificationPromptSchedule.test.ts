import {
  createNotificationPromptState,
  getNotificationPromptMode,
  markNotificationPromptShown,
  parseNotificationPromptState,
  shouldShowNotificationPrompt,
} from "@/src/utils/notificationPromptSchedule";

const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000;

describe("getNotificationPromptMode", () => {
  it("returns null when granted", () => {
    expect(
      getNotificationPromptMode({ status: "granted", canAskAgain: false }),
    ).toBeNull();
  });

  it("returns ask when system prompt is still available", () => {
    expect(
      getNotificationPromptMode({ status: "undetermined", canAskAgain: true }),
    ).toBe("ask");
  });

  it("returns settings when denied permanently", () => {
    expect(
      getNotificationPromptMode({ status: "denied", canAskAgain: false }),
    ).toBe("settings");
  });
});

describe("shouldShowNotificationPrompt", () => {
  it("waits 3, 7, 14 days for ask and then repeats every 14 days", () => {
    let state = createNotificationPromptState(T0);

    expect(shouldShowNotificationPrompt("ask", state, T0 + 2 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("ask", state, T0 + 3 * DAY)).toBe(true);
    state = markNotificationPromptShown("ask", state, T0 + 3 * DAY);

    expect(shouldShowNotificationPrompt("ask", state, T0 + 9 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("ask", state, T0 + 10 * DAY)).toBe(
      true,
    );
    state = markNotificationPromptShown("ask", state, T0 + 10 * DAY);

    expect(shouldShowNotificationPrompt("ask", state, T0 + 24 * DAY)).toBe(
      true,
    );
    state = markNotificationPromptShown("ask", state, T0 + 24 * DAY);

    expect(shouldShowNotificationPrompt("ask", state, T0 + 37 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("ask", state, T0 + 38 * DAY)).toBe(
      true,
    );
    state = markNotificationPromptShown("ask", state, T0 + 38 * DAY);

    expect(shouldShowNotificationPrompt("ask", state, T0 + 51 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("ask", state, T0 + 52 * DAY)).toBe(
      true,
    );
  });

  it("counts settings separately: 7 then 30 days, then every 30 days", () => {
    let state = markNotificationPromptShown(
      "ask",
      createNotificationPromptState(T0),
      T0 + 3 * DAY,
    );

    expect(shouldShowNotificationPrompt("settings", state, T0 + 7 * DAY)).toBe(
      true,
    );
    state = markNotificationPromptShown("settings", state, T0 + 7 * DAY);

    expect(shouldShowNotificationPrompt("settings", state, T0 + 36 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("settings", state, T0 + 37 * DAY)).toBe(
      true,
    );
    state = markNotificationPromptShown("settings", state, T0 + 37 * DAY);

    expect(shouldShowNotificationPrompt("settings", state, T0 + 66 * DAY)).toBe(
      false,
    );
    expect(shouldShowNotificationPrompt("settings", state, T0 + 67 * DAY)).toBe(
      true,
    );
  });
});

describe("parseNotificationPromptState", () => {
  it("returns null for empty or broken input", () => {
    expect(parseNotificationPromptState(null)).toBeNull();
    expect(parseNotificationPromptState("{oops")).toBeNull();
    expect(parseNotificationPromptState('{"firstSeenAt":1}')).toBeNull();
  });

  it("round-trips a valid state", () => {
    const state = createNotificationPromptState(T0);
    expect(parseNotificationPromptState(JSON.stringify(state))).toEqual(state);
  });
});
