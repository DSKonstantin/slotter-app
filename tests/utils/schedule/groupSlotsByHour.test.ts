import { groupSlotsByHour } from "@/src/utils/schedule/groupSlotsByHour";

describe("groupSlotsByHour", () => {
  it("groups HH:mm slots by their hour prefix, preserving order within a group", () => {
    const result = groupSlotsByHour(["09:00", "09:30", "10:00", "09:15"]);
    expect([...result.keys()]).toEqual(["09", "10"]);
    expect(result.get("09")).toEqual(["09:00", "09:30", "09:15"]);
    expect(result.get("10")).toEqual(["10:00"]);
  });

  it("returns an empty map for an empty input", () => {
    expect(groupSlotsByHour([])).toEqual(new Map());
  });
});
