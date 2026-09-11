import {
  ANY_TOKEN_RE,
  STRICT_TOKEN_RE,
} from "@/src/components/app/account/clientNotifications/templates/tokenPattern";

const matchAllKeys = (re: RegExp, text: string) =>
  [...text.matchAll(re)].map((m) => m[1]);

describe("STRICT_TOKEN_RE", () => {
  it("захватывает ключ токена из {{KEY}}", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "{{CLIENT_NAME}}")).toEqual([
      "CLIENT_NAME",
    ]);
  });

  it("находит все токены в строке", () => {
    expect(
      matchAllKeys(STRICT_TOKEN_RE, "{{CLIENT_NAME}} — {{DATE_SERVICE}}"),
    ).toEqual(["CLIENT_NAME", "DATE_SERVICE"]);
  });

  it("не матчит токен с пробелами внутри скобок", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "{{ CLIENT_NAME }}")).toEqual([]);
  });

  it("не матчит токен с кириллицей", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "{{Имя клиента}}")).toEqual([]);
  });

  it("не матчит незакрытый токен", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "{{CLIENT_NAME")).toEqual([]);
  });

  it("не матчит пустые скобки", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "{{}}")).toEqual([]);
  });

  it("возвращает пусто, если токенов нет", () => {
    expect(matchAllKeys(STRICT_TOKEN_RE, "Просто текст")).toEqual([]);
  });
});

describe("ANY_TOKEN_RE", () => {
  it("захватывает содержимое даже с пробелами и кириллицей", () => {
    expect(matchAllKeys(ANY_TOKEN_RE, "{{ CLIENT_NAME }}")).toEqual([
      " CLIENT_NAME ",
    ]);
    expect(matchAllKeys(ANY_TOKEN_RE, "{{Имя клиента}}")).toEqual([
      "Имя клиента",
    ]);
  });

  it("захватывает пустые скобки", () => {
    expect(matchAllKeys(ANY_TOKEN_RE, "{{}}")).toEqual([""]);
  });

  it("находит все вхождения в строке", () => {
    expect(
      matchAllKeys(ANY_TOKEN_RE, "{{client_name}}, {{date_service}}"),
    ).toEqual(["client_name", "date_service"]);
  });

  it("не матчит незакрытую скобку", () => {
    expect(matchAllKeys(ANY_TOKEN_RE, "{{CLIENT_NAME")).toEqual([]);
  });

  it("не захватывает через вложенную скобку", () => {
    expect(matchAllKeys(ANY_TOKEN_RE, "{{FOO{{BAR}}}}")).toEqual(["BAR"]);
  });
});
