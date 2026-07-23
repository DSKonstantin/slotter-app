import { safeRefetch } from "@/src/utils/safeRefetch";

describe("safeRefetch", () => {
  it("returns the refetch call's result when it does not throw", () => {
    const refetch = jest.fn(() => "ok");
    expect(safeRefetch(refetch)).toBe("ok");
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("swallows a synchronous throw from refetch and returns undefined", () => {
    const refetch = jest.fn(() => {
      throw new Error("subscription not started yet");
    });
    expect(safeRefetch(refetch)).toBeUndefined();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
