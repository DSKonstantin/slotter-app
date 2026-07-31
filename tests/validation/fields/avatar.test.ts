import { avatarField } from "@/src/validation/fields/avatar";

describe("avatarField", () => {
  it("is optional — undefined and null both pass", () => {
    expect(avatarField.isValidSync(undefined)).toBe(true);
    expect(avatarField.isValidSync(null)).toBe(true);
  });

  it("defaults to null when no value is given", () => {
    expect(avatarField.cast(undefined)).toBeNull();
  });

  it("accepts any upload-file-shaped value since it is a mixed schema", () => {
    expect(avatarField.isValidSync({ uri: "file:///photo.jpg" })).toBe(true);
  });
});
