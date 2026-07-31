import { nameField } from "@/src/validation/fields/name";
import { surnameField } from "@/src/validation/fields/surname";
import { professionField } from "@/src/validation/fields/profession";
import { titleField } from "@/src/validation/fields/title";
import { descriptionField } from "@/src/validation/fields/description";

describe.each([
  { label: "nameField", field: nameField, min: 2, max: 30, required: true },
  {
    label: "surnameField",
    field: surnameField,
    min: 2,
    max: 50,
    required: true,
  },
  {
    label: "professionField",
    field: professionField,
    min: 2,
    max: 150,
    required: true,
  },
  { label: "titleField", field: titleField, min: 2, max: 100, required: true },
])("$label", ({ field, min, max, required }) => {
  it(`requires a value: ${required}`, () => {
    expect(field.isValidSync(undefined)).toBe(!required);
  });

  it(`enforces the ${min}-${max} character window`, () => {
    expect(field.isValidSync("a".repeat(min - 1))).toBe(false);
    expect(field.isValidSync("a".repeat(min))).toBe(true);
    expect(field.isValidSync("a".repeat(max))).toBe(true);
    expect(field.isValidSync("a".repeat(max + 1))).toBe(false);
  });

  it("trims surrounding whitespace before checking length", () => {
    expect(field.isValidSync(`  ${"a".repeat(min)}  `)).toBe(true);
  });
});

describe("descriptionField", () => {
  it("is optional and defaults to an empty string rather than failing", () => {
    expect(descriptionField.isValidSync(undefined)).toBe(true);
    expect(descriptionField.cast(undefined)).toBe("");
  });

  it("enforces the 600 character cap", () => {
    expect(descriptionField.isValidSync("a".repeat(600))).toBe(true);
    expect(descriptionField.isValidSync("a".repeat(601))).toBe(false);
  });
});
