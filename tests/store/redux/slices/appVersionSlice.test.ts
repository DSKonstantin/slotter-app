import reducer, {
  dismissUpdate,
  setAppVersion,
} from "@/src/store/redux/slices/appVersionSlice";

describe("appVersionSlice", () => {
  it("defaults to payment-enabled ('ispe'), a green update status and a not-yet-dismissed update", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual({
      ispe: true,
      updateStatus: "green",
      storeUrl: null,
      updateDismissed: false,
    });
  });

  it("setAppVersion replaces all three fields together", () => {
    const initialState = {
      ispe: true,
      updateStatus: "green" as const,
      storeUrl: null,
      updateDismissed: false,
    };
    const next = reducer(
      initialState,
      setAppVersion({
        ispe: false,
        updateStatus: "red",
        storeUrl: "https://apps.apple.com/app/slotter",
      }),
    );
    expect(next).toEqual({
      ispe: false,
      updateStatus: "red",
      storeUrl: "https://apps.apple.com/app/slotter",
      updateDismissed: false,
    });
  });

  it("dismissUpdate marks the update modal as dismissed", () => {
    const next = reducer(undefined, dismissUpdate());
    expect(next.updateDismissed).toBe(true);
  });
});
