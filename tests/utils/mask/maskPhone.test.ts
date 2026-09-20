import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";

describe("maskPhone", () => {
  it("formats an 11-digit number starting with 7", () => {
    expect(maskPhone("79991234567")).toBe("+7 999 123-45-67");
  });

  it("converts a leading 8 to 7 for an 11-digit number", () => {
    expect(maskPhone("89991234567")).toBe("+7 999 123-45-67");
  });

  it("formats a plain 10-digit subscriber number", () => {
    const masked = maskPhone("9991234567");
    expect(masked).toBe("+7 999 123-45-67");
    expect(unMask(masked)).toBe("79991234567");
  });

  it("builds up the mask progressively as digits are typed", () => {
    expect(maskPhone("799912").trim()).toBe("+7 999 12");
  });

  it("caps the input at 11 digits", () => {
    expect(maskPhone("799912345678999")).toBe("+7 999 123-45-67");
  });
});
