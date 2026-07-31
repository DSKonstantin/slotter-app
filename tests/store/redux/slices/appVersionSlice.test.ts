import reducer, {
  setAppVersion,
} from "@/src/store/redux/slices/appVersionSlice";

describe("appVersionSlice", () => {
  it("defaults to payment-enabled ('ispe') and a green update status", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual({
      ispe: true,
      updateStatus: "green",
      storeUrl: null,
    });
  });

  it("setAppVersion replaces all three fields together", () => {
    const initialState = {
      ispe: true,
      updateStatus: "green" as const,
      storeUrl: null,
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
    });
  });
});
