import {
  CODE_METHODS,
  resolveCodeMethod,
  toCodeSession,
} from "@/src/components/auth/enterCode/codeMethods";

describe("resolveCodeMethod", () => {
  it("returns the known method as is", () => {
    expect(resolveCodeMethod("telegram")).toBe("telegram");
    expect(resolveCodeMethod("flashcall")).toBe("flashcall");
  });

  it("falls back to flashcall for unknown or missing methods", () => {
    expect(resolveCodeMethod(undefined)).toBe("flashcall");
    expect(resolveCodeMethod("callback")).toBe("flashcall");
    expect(resolveCodeMethod("toString")).toBe("flashcall");
    expect(resolveCodeMethod("")).toBe("flashcall");
  });
});

describe("toCodeSession", () => {
  it("maps the bot link", () => {
    expect(toCodeSession({ bot_url: "https://t.me/bot" })).toEqual({
      link: "https://t.me/bot",
    });
  });

  it("defaults to an empty link", () => {
    expect(toCodeSession({})).toEqual({ link: "" });
    expect(toCodeSession({ bot_url: null })).toEqual({ link: "" });
  });

  it("takes the link from a whole send_code answer", () => {
    expect(
      toCodeSession({
        bot_url: "https://t.me/bot",
        is_code_sent: true,
      } as never),
    ).toEqual({ link: "https://t.me/bot" });
  });
});

describe("CODE_METHODS", () => {
  it("flashcall is confirmed without an explicit method and has no link", () => {
    const flashcall = CODE_METHODS.flashcall;
    expect(flashcall.defaultCodeLength).toBe(4);
    expect(flashcall.confirmMethod).toBeUndefined();
    expect(flashcall.link).toBeUndefined();
    expect(flashcall.title(4)).toBe("Введите последние 4 цифры");
  });

  it("flashcall subtitle says where the call comes and which digits to enter", () => {
    const subtitle = CODE_METHODS.flashcall.subtitle(4, "+7 916 123-45-67");

    expect(subtitle).toContain("на номер +7 916 123-45-67");
    expect(subtitle).toContain("последние 4 цифры");
    expect(subtitle).toContain("с которого звонят");
  });

  it("telegram is confirmed with method telegram and has a link", () => {
    const telegram = CODE_METHODS.telegram;
    expect(telegram.defaultCodeLength).toBe(6);
    expect(telegram.confirmMethod).toBe("telegram");
    expect(telegram.link?.title).toBe("Открыть бота в Telegram");
    expect(telegram.title(6)).toBe("Введите код из Telegram");
  });

  it("telegram has one short subtitle with the phone and the share step", () => {
    const subtitle = CODE_METHODS.telegram.subtitle(6, "+7 916 123-45-67");

    expect(subtitle).toContain("для номера +7 916 123-45-67");
    expect(subtitle).toContain("/start");
    expect(subtitle).toContain("«Поделиться номером»");
    expect(subtitle.length).toBeLessThan(110);
  });

  it("telegram has no start modal anymore", () => {
    expect(CODE_METHODS.telegram).not.toHaveProperty("startModal");
  });

  it("telegram maps both telegram errors to a call suggestion", () => {
    const { errors } = CODE_METHODS.telegram;
    expect(errors.telegram_rate_limited).toContain("звонком");
    expect(errors.telegram_unavailable).toContain("звонком");
  });

  it("flashcall maps its rate limit error", () => {
    expect(CODE_METHODS.flashcall.errors.flashcall_rate_limited).toBeTruthy();
  });

  it("every method has an unavailable text for a mismatched server method", () => {
    Object.values(CODE_METHODS).forEach((config) => {
      expect(config.unavailableText.length).toBeGreaterThan(0);
    });
  });

  it("waits longer before suggesting a fallback for telegram", () => {
    expect(CODE_METHODS.telegram.fallbackDelayMs).toBeGreaterThan(
      CODE_METHODS.flashcall.fallbackDelayMs,
    );
  });
});

describe("expired text", () => {
  it("is defined for every method", () => {
    Object.values(CODE_METHODS).forEach((config) => {
      expect(config.expiredText.length).toBeGreaterThan(0);
    });
  });
});
