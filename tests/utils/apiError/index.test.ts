import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiFieldError,
  getBreakAfterIntersectionHint,
  isAuthError,
  isQuotaExceeded,
} from "@/src/utils/apiError/index";

describe("isAuthError", () => {
  it("is false for non-object or non-401 errors", () => {
    expect(isAuthError(null)).toBe(false);
    expect(isAuthError("nope")).toBe(false);
    expect(isAuthError({ status: 404, data: {} })).toBe(false);
  });

  it("treats a 401 with no parseable message as an auth error", () => {
    expect(isAuthError({ status: 401, data: {} })).toBe(true);
  });

  it("treats known token-dead messages as auth errors", () => {
    expect(
      isAuthError({
        status: 401,
        data: { error: "Срок действия токена истек" },
      }),
    ).toBe(true);
  });

  it("does not treat a business-logic 401 as an auth error", () => {
    expect(
      isAuthError({
        status: 401,
        data: { error: "Неверный текущий пароль" },
      }),
    ).toBe(false);
  });
});

describe("isQuotaExceeded", () => {
  it("is true only for the QUOTA_EXCEEDED error code", () => {
    expect(isQuotaExceeded({ data: { error: "QUOTA_EXCEEDED" } })).toBe(true);
    expect(isQuotaExceeded({ data: { error: "OTHER" } })).toBe(false);
    expect(isQuotaExceeded(null)).toBe(false);
  });
});

describe("getApiErrorCode", () => {
  it("returns the string code when present", () => {
    expect(getApiErrorCode({ data: { code: "account_deactivated" } })).toBe(
      "account_deactivated",
    );
  });

  it("returns null when absent or not a string", () => {
    expect(getApiErrorCode({ data: {} })).toBeNull();
    expect(getApiErrorCode({ data: { code: 123 } })).toBeNull();
    expect(getApiErrorCode(null)).toBeNull();
  });
});

describe("getApiErrorMessage", () => {
  it("returns the fallback when the error is not shaped like an API error", () => {
    expect(getApiErrorMessage(null, "Что-то пошло не так")).toBe(
      "Что-то пошло не так",
    );
    expect(getApiErrorMessage(new Error("boom"), "fallback")).toBe("fallback");
  });

  it("joins and capitalizes a flat errors array", () => {
    expect(
      getApiErrorMessage(
        { data: { errors: ["неверный телефон", "неверный email"] } },
        "fallback",
      ),
    ).toBe("Неверный телефон, неверный email");
  });

  it("flattens a field->messages errors object", () => {
    expect(
      getApiErrorMessage(
        { data: { errors: { date: ["рабочий день не найден"] } } },
        "fallback",
      ),
    ).toBe("Рабочий день не найден");
  });

  it("uses the single error string when there is no errors object", () => {
    expect(
      getApiErrorMessage({ data: { error: "клиент не найден" } }, "fallback"),
    ).toBe("Клиент не найден");
  });

  it("falls back when the backend leaks a non-Cyrillic technical message", () => {
    expect(
      getApiErrorMessage(
        { data: { error: "Green API credentials not configured" } },
        "fallback",
      ),
    ).toBe("fallback");
  });

  it("falls back on a Rails i18n 'Translation missing' string", () => {
    expect(
      getApiErrorMessage(
        { data: { error: "Translation missing: ru.errors" } },
        "fallback",
      ),
    ).toBe("fallback");
  });

  it("returns the fallback when errors/error are both absent", () => {
    expect(getApiErrorMessage({ data: {} }, "fallback")).toBe("fallback");
  });
});

describe("getApiFieldError", () => {
  it("returns the capitalized message for the requested field", () => {
    expect(
      getApiFieldError(
        {
          data: {
            errors: {
              break_after_minutes: [
                "перерыв после записи пересекается с другой записью",
              ],
            },
          },
        },
        "break_after_minutes",
      ),
    ).toBe("Перерыв после записи пересекается с другой записью");
  });

  it("joins multiple messages for the same field", () => {
    expect(
      getApiFieldError(
        { data: { errors: { name: ["слишком длинное", "неверный формат"] } } },
        "name",
      ),
    ).toBe("Слишком длинное, неверный формат");
  });

  it("returns undefined when that specific field has no error, even if others do", () => {
    expect(
      getApiFieldError(
        { data: { errors: { date: ["рабочий день не найден"] } } },
        "break_after_minutes",
      ),
    ).toBeUndefined();
  });

  it("returns undefined when errors is a flat array (no field keys)", () => {
    expect(
      getApiFieldError(
        { data: { errors: ["неверный телефон"] } },
        "break_after_minutes",
      ),
    ).toBeUndefined();
  });

  it("returns undefined when errors is absent or the error isn't API-shaped", () => {
    expect(
      getApiFieldError({ data: {} }, "break_after_minutes"),
    ).toBeUndefined();
    expect(getApiFieldError(null, "break_after_minutes")).toBeUndefined();
    expect(
      getApiFieldError(new Error("boom"), "break_after_minutes"),
    ).toBeUndefined();
  });

  it("falls back to undefined when the only message is a non-Cyrillic technical leak", () => {
    expect(
      getApiFieldError(
        { data: { errors: { break_after_minutes: ["Translation missing"] } } },
        "break_after_minutes",
      ),
    ).toBeUndefined();
  });
});

describe("getBreakAfterIntersectionHint", () => {
  it("returns the hint when break_after_minutes overlaps another appointment", () => {
    expect(
      getBreakAfterIntersectionHint({
        data: {
          errors: {
            break_after_minutes: [
              "перерыв после записи пересекается с другой записью",
            ],
          },
        },
      }),
    ).toBe(
      "Уменьшите перерыв, чтобы он заканчивался до начала следующей записи, выберите «Без перерыва» (0) или другое время записи",
    );
  });

  it("returns undefined for a different break_after_minutes error", () => {
    expect(
      getBreakAfterIntersectionHint({
        data: { errors: { break_after_minutes: ["должно быть кратно 5"] } },
      }),
    ).toBeUndefined();
  });

  it("returns undefined when break_after_minutes has no error, even if other fields do", () => {
    expect(
      getBreakAfterIntersectionHint({
        data: { errors: { date: ["рабочий день не найден"] } },
      }),
    ).toBeUndefined();
  });

  it("returns undefined when errors is a flat array or absent", () => {
    expect(
      getBreakAfterIntersectionHint({
        data: { errors: ["перерыв после записи пересекается с другой записью"] },
      }),
    ).toBeUndefined();
    expect(getBreakAfterIntersectionHint({ data: {} })).toBeUndefined();
    expect(getBreakAfterIntersectionHint(null)).toBeUndefined();
  });
});
