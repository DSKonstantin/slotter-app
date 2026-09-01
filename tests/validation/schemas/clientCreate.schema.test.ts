import { ClientCreateSchema } from "@/src/validation/schemas/clientCreate.schema";

describe("ClientCreateSchema", () => {
  const validBase = { name: "Иван", phone: "+7 999 123-45-67" };

  it("accepts a valid name + phone", () => {
    expect(ClientCreateSchema.isValidSync(validBase)).toBe(true);
  });

  it("requires phone — #33 (was misleadingly .optional())", () => {
    expect(ClientCreateSchema.isValidSync({ name: "Иван" })).toBe(false);
    expect(ClientCreateSchema.isValidSync({ ...validBase, phone: "" })).toBe(
      false,
    );
  });

  it("rejects a malformed phone", () => {
    expect(
      ClientCreateSchema.isValidSync({ ...validBase, phone: "+7 123" }),
    ).toBe(false);
  });

  it("allows optional comment and customer_tag", () => {
    expect(
      ClientCreateSchema.isValidSync({
        ...validBase,
        comment: "заметка",
        customer_tag: null,
      }),
    ).toBe(true);
  });
});
