import { renderPreview } from "@/src/components/app/account/clientNotifications/templates/tokenText/renderPreview";
import { validateBody } from "@/src/components/app/account/clientNotifications/templates/tokenText/validateBody";
import { insertToken } from "@/src/components/app/account/clientNotifications/templates/tokenText/insertToken";
import { collapseTokenOnDelete } from "@/src/components/app/account/clientNotifications/templates/tokenText/collapseTokenOnDelete";
import { getActiveTokenTrigger } from "@/src/components/app/account/clientNotifications/templates/tokenText/activeTokenTrigger";
import type { TemplateVariable } from "@/src/store/redux/services/api-types";

const vars: TemplateVariable[] = [
  { key: "CLIENT_NAME", title: "Имя клиента", example: "Анна" },
  { key: "DATE_SERVICE", title: "Дата визита", example: "14 мая" },
  { key: "TIME_SERVICE", title: "Время визита", example: "15:00" },
];

describe("renderPreview", () => {
  it("подставляет все известные переменные", () => {
    expect(
      renderPreview(
        "{{CLIENT_NAME}}, запись {{DATE_SERVICE}} в {{TIME_SERVICE}}",
        vars,
      ),
    ).toBe("Анна, запись 14 мая в 15:00");
  });

  it("заменяет все вхождения одного токена", () => {
    expect(renderPreview("{{TIME_SERVICE}}-{{TIME_SERVICE}}", vars)).toBe(
      "15:00-15:00",
    );
  });

  it("неизвестный токен оставляет как есть", () => {
    expect(renderPreview("{{CLIENT_NAME}} — {{UNKNOWN}}", vars)).toBe(
      "Анна — {{UNKNOWN}}",
    );
  });

  it("регистр важен — токен в другом регистре не подставляется", () => {
    expect(renderPreview("{{client_name}}", vars)).toBe("{{client_name}}");
  });

  it("пустой текст возвращает пустую строку", () => {
    expect(renderPreview("", vars)).toBe("");
  });

  it("не трогает текст без токенов", () => {
    expect(renderPreview("Просто текст", vars)).toBe("Просто текст");
  });
});

describe("validateBody", () => {
  const allowedKeys = vars.map((v) => v.key);

  it("пустой текст — ошибка", () => {
    expect(validateBody("   ", allowedKeys)).toBe("Текст не может быть пустым");
  });

  it("текст длиннее лимита — ошибка", () => {
    expect(validateBody("a".repeat(1001), allowedKeys)).toBe(
      "Не длиннее 1000 символов",
    );
  });

  it("незакрытая скобка — ошибка", () => {
    expect(validateBody("{{CLIENT_NAME", allowedKeys)).toBe(
      "Незакрытая скобка в переменной",
    );
  });

  it("неизвестная переменная — ошибка", () => {
    expect(validateBody("{{client_name}}", allowedKeys)).toBe(
      "Неизвестные переменные: client_name",
    );
  });

  it("валидный текст с известными переменными — null", () => {
    expect(
      validateBody("{{CLIENT_NAME}}, {{DATE_SERVICE}}", allowedKeys),
    ).toBeNull();
  });

  it("текст без переменных — null", () => {
    expect(validateBody("Просто текст", allowedKeys)).toBeNull();
  });
});

describe("insertToken", () => {
  it("вставляет токен в позицию курсора и сдвигает курсор за него", () => {
    const r = insertToken(
      "Привет, !",
      { start: 8, end: 8 },
      "{{CLIENT_NAME}}",
      500,
    );
    expect(r.text).toBe("Привет, {{CLIENT_NAME}}!");
    expect(r.selection).toEqual({ start: 23, end: 23 });
  });

  it("заменяет выделенный диапазон", () => {
    const r = insertToken(
      "aXXXb",
      { start: 1, end: 4 },
      "{{TIME_SERVICE}}",
      500,
    );
    expect(r.text).toBe("a{{TIME_SERVICE}}b");
    expect(r.selection).toEqual({ start: 17, end: 17 });
  });

  it("не вставляет, если превышен maxLength", () => {
    const r = insertToken("abc", { start: 3, end: 3 }, "{{TIME_SERVICE}}", 5);
    expect(r.text).toBe("abc");
    expect(r.selection).toEqual({ start: 3, end: 3 });
  });

  it("клампит курсор за пределами текста к его длине", () => {
    const r = insertToken("abc", { start: 99, end: 99 }, "X", 500);
    expect(r.text).toBe("abcX");
    expect(r.selection).toEqual({ start: 4, end: 4 });
  });

  it("вставка в начало пустого текста", () => {
    const r = insertToken("", { start: 0, end: 0 }, "{{TIME_SERVICE}}", 500);
    expect(r.text).toBe("{{TIME_SERVICE}}");
    expect(r.selection).toEqual({ start: 16, end: 16 });
  });
});

describe("collapseTokenOnDelete", () => {
  const oldText = "Hi {{CLIENT_NAME}} bye";

  it("бэкспейс сразу после токена удаляет его целиком", () => {
    const newText = oldText.slice(0, 17) + oldText.slice(18);
    const r = collapseTokenOnDelete(oldText, newText);
    expect(r).toEqual({ text: "Hi  bye", selection: { start: 3, end: 3 } });
  });

  it("бэкспейс из середины токена удаляет его целиком", () => {
    const newText = oldText.slice(0, 10) + oldText.slice(11);
    const r = collapseTokenOnDelete(oldText, newText);
    expect(r).toEqual({ text: "Hi  bye", selection: { start: 3, end: 3 } });
  });

  it("удаление символа вне токена не трогается", () => {
    const newText = oldText.slice(1);
    expect(collapseTokenOnDelete(oldText, newText)).toBeNull();
  });

  it("удаление диапазона (не один символ) не трогается", () => {
    const newText = "Hi  bye";
    expect(collapseTokenOnDelete(oldText, newText)).toBeNull();
  });

  it("текст без токенов не трогается", () => {
    const text = "Just text";
    const newText = text.slice(0, -1);
    expect(collapseTokenOnDelete(text, newText)).toBeNull();
  });
});

describe("getActiveTokenTrigger", () => {
  it("только что открытые скобки — пустой запрос", () => {
    expect(getActiveTokenTrigger("Hi {{", 5)).toEqual({
      start: 3,
      query: "",
    });
  });

  it("печатает имя переменной — запрос растёт", () => {
    expect(getActiveTokenTrigger("Hi {{cli", 8)).toEqual({
      start: 3,
      query: "cli",
    });
  });

  it("токен уже закрыт — триггера нет", () => {
    const text = "Hi {{CLIENT_NAME}} bye";
    expect(getActiveTokenTrigger(text, 18)).toBeNull();
  });

  it("пробел внутри скобок ломает триггер", () => {
    expect(getActiveTokenTrigger("Hi {{cli ent", 12)).toBeNull();
  });

  it("нет открывающих скобок вообще", () => {
    expect(getActiveTokenTrigger("Hi there", 8)).toBeNull();
  });

  it("более поздние скобки после курсора не учитываются", () => {
    const text = "Hi {{CLIENT_NAME}} bye {{";
    expect(getActiveTokenTrigger(text, 2)).toBeNull();
  });
});
