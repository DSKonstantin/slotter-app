import AsyncStorage from "@react-native-async-storage/async-storage";
import { takeDueNotificationPromptMode } from "@/src/utils/notificationPromptStorage";
import { getNotificationPromptStorageKey } from "@/src/utils/notificationPromptSchedule";

const DAY = 24 * 60 * 60 * 1000;
const USER_ID = 7;
const KEY = getNotificationPromptStorageKey(USER_ID);

const canAsk = { status: "undetermined", canAskAgain: true };
const denied = { status: "denied", canAskAgain: false };
const granted = { status: "granted", canAskAgain: false };

const readState = async () => JSON.parse((await AsyncStorage.getItem(KEY))!);

const shiftBack = async (days: number) => {
  const state = await readState();
  state.firstSeenAt -= days * DAY;
  if (state.ask.lastShownAt) state.ask.lastShownAt -= days * DAY;
  if (state.settings.lastShownAt) state.settings.lastShownAt -= days * DAY;
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
};

describe("takeDueNotificationPromptMode", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("does not show and stores nothing when permission is granted", async () => {
    expect(await takeDueNotificationPromptMode(USER_ID, granted)).toBeNull();
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it("stays silent on the first call (right after onboarding) and remembers the time", async () => {
    expect(await takeDueNotificationPromptMode(USER_ID, canAsk)).toBeNull();
    expect((await readState()).ask.count).toBe(0);
  });

  it("does not show again on the same day", async () => {
    await takeDueNotificationPromptMode(USER_ID, canAsk);
    expect(await takeDueNotificationPromptMode(USER_ID, canAsk)).toBeNull();
  });

  it("shows 'ask' after 3 days and counts the show", async () => {
    await takeDueNotificationPromptMode(USER_ID, canAsk);
    await shiftBack(3);

    expect(await takeDueNotificationPromptMode(USER_ID, canAsk)).toBe("ask");
    expect((await readState()).ask.count).toBe(1);
    expect(await takeDueNotificationPromptMode(USER_ID, canAsk)).toBeNull();
  });

  it("shows 'settings' only after 7 days", async () => {
    await takeDueNotificationPromptMode(USER_ID, denied);
    await shiftBack(6);
    expect(await takeDueNotificationPromptMode(USER_ID, denied)).toBeNull();

    await shiftBack(1);
    expect(await takeDueNotificationPromptMode(USER_ID, denied)).toBe(
      "settings",
    );
  });
});
