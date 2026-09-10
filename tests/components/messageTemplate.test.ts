import { substituteTemplate } from "@/src/components/app/account/clientNotifications/templates/substituteTemplate";
import { insertToken } from "@/src/components/app/account/clientNotifications/templates/insertToken";
import {
  TEMPLATE_CONFIGS,
  type TemplateKind,
} from "@/src/components/app/account/clientNotifications/templates/templateConfigs";
import type { TemplateVariable } from "@/src/components/app/account/clientNotifications/templates/templateVariables";

const vars: TemplateVariable[] = [
  { token: "{{client_name}}", label: "Имя клиента", sample: "Анна" },
  { token: "{{date}}", label: "Дата записи", sample: "14 мая" },
  { token: "{{time}}", label: "Время записи", sample: "15:00" },
];

describe("substituteTemplate", () => {
  it("подставляет все известные переменные", () => {
    expect(
      substituteTemplate("{{client_name}}, запись {{date}} в {{time}}", vars),
    ).toBe("Анна, запись 14 мая в 15:00");
  });

  it("заменяет все вхождения одного токена", () => {
    expect(substituteTemplate("{{time}}-{{time}}", vars)).toBe("15:00-15:00");
  });

  it("неизвестный токен оставляет как есть", () => {
    expect(substituteTemplate("{{client_name}} — {{unknown}}", vars)).toBe(
      "Анна — {{unknown}}",
    );
  });

  it("пустой текст возвращает пустую строку", () => {
    expect(substituteTemplate("", vars)).toBe("");
  });

  it("не трогает текст без токенов", () => {
    expect(substituteTemplate("Просто текст", vars)).toBe("Просто текст");
  });
});

describe("insertToken", () => {
  it("вставляет токен в позицию курсора и сдвигает курсор за него", () => {
    const r = insertToken(
      "Привет, !",
      { start: 8, end: 8 },
      "{{client_name}}",
      500,
    );
    expect(r.text).toBe("Привет, {{client_name}}!");
    expect(r.selection).toEqual({ start: 23, end: 23 });
  });

  it("заменяет выделенный диапазон", () => {
    const r = insertToken("aXXXb", { start: 1, end: 4 }, "{{time}}", 500);
    expect(r.text).toBe("a{{time}}b");
    expect(r.selection).toEqual({ start: 9, end: 9 });
  });

  it("не вставляет, если превышен maxLength", () => {
    const r = insertToken("abc", { start: 3, end: 3 }, "{{time}}", 5);
    expect(r.text).toBe("abc");
    expect(r.selection).toEqual({ start: 3, end: 3 });
  });

  it("клампит курсор за пределами текста к его длине", () => {
    const r = insertToken("abc", { start: 99, end: 99 }, "X", 500);
    expect(r.text).toBe("abcX");
    expect(r.selection).toEqual({ start: 4, end: 4 });
  });

  it("вставка в начало пустого текста", () => {
    const r = insertToken("", { start: 0, end: 0 }, "{{time}}", 500);
    expect(r.text).toBe("{{time}}");
    expect(r.selection).toEqual({ start: 8, end: 8 });
  });
});

describe("TEMPLATE_CONFIGS — defaultText ссылается только на объявленные токены", () => {
  const kinds = Object.keys(TEMPLATE_CONFIGS) as TemplateKind[];

  it.each(kinds)("%s", (kind) => {
    const config = TEMPLATE_CONFIGS[kind];
    const declared = new Set(config.variables.map((v) => v.token));
    const used = config.defaultText.match(/\{\{[^}]+\}\}/g) ?? [];

    for (const token of used) {
      expect(declared.has(token)).toBe(true);
    }
  });
});
