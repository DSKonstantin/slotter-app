import { router } from "expo-router";
import { navigateFromNotification } from "@/src/utils/notificationNavigation";
import { Routers } from "@/src/constants/routers";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

const openPersonalAccount = jest.fn();
const push = router.push as jest.Mock;

const run = (
  params: Omit<
    Parameters<typeof navigateFromNotification>[0],
    "openPersonalAccount"
  >,
) => navigateFromNotification({ ...params, openPersonalAccount });

describe("navigateFromNotification", () => {
  beforeEach(() => jest.clearAllMocks());

  it("opens the appointment for a subject even if the kind has a detail route", () => {
    expect(
      run({
        kind: "appointment_cancelled",
        subjectId: 7,
        subjectType: "Appointment",
      }),
    ).toBe(true);
    expect(push).toHaveBeenCalledWith(Routers.app.slot(7));
  });

  it("opens the chat for a ChatRoom subject", () => {
    run({
      kind: "customer_delivery_failed",
      subjectId: 3,
      subjectType: "ChatRoom",
    });
    expect(push).toHaveBeenCalledWith(Routers.app.chat.room(3));
  });

  it("infers the subject type from the kind for pushes without subject_type", () => {
    run({ kind: "appointment_reminder", subjectId: 9 });
    expect(push).toHaveBeenCalledWith(Routers.app.slot(9));
    run({ kind: "chat_new_activity", subjectId: 4 });
    expect(push).toHaveBeenCalledWith(Routers.app.chat.room(4));
  });

  it("falls back to the kind route without a subject", () => {
    expect(run({ kind: "appointment_cancelled" })).toBe(true);
    expect(push).toHaveBeenCalledWith(
      Routers.app.account.clientNotifications.detail("appointment_cancelled"),
    );
  });

  it("returns false when nothing matches", () => {
    expect(run({ kind: "customer_delivery_failed", subjectId: 5 })).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });
});
