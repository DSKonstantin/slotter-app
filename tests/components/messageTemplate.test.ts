import { renderPreview } from "@/src/components/app/account/clientNotifications/templates/tokenText/renderPreview";
import { validateBody } from "@/src/components/app/account/clientNotifications/templates/tokenText/validateBody";
import { insertToken } from "@/src/components/app/account/clientNotifications/templates/tokenText/insertToken";
import { collapseTokenOnDelete } from "@/src/components/app/account/clientNotifications/templates/tokenText/collapseTokenOnDelete";
import { getActiveTokenTrigger } from "@/src/components/app/account/clientNotifications/templates/tokenText/activeTokenTrigger";
import {
  moveInsertionOutOfToken,
  snapSelectionToTokens,
} from "@/src/components/app/account/clientNotifications/templates/tokenText/snapSelectionToTokens";
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
    expect(r).toEqual({ text: "Hi bye", selection: { start: 2, end: 2 } });
  });

  it("бэкспейс из середины токена удаляет его целиком", () => {
    const newText = oldText.slice(0, 10) + oldText.slice(11);
    const r = collapseTokenOnDelete(oldText, newText);
    expect(r).toEqual({ text: "Hi bye", selection: { start: 2, end: 2 } });
  });

  it("токен в конце строки удаляется вместе с пробелом перед ним", () => {
    const text = "Hi {{CLIENT_NAME}}";
    const r = collapseTokenOnDelete(text, text.slice(0, -1));
    expect(r).toEqual({ text: "Hi", selection: { start: 2, end: 2 } });
  });

  it("токен перед переносом строки удаляется вместе с пробелом перед ним", () => {
    const text = "Hi {{CLIENT_NAME}}\nbye";
    const newText = text.slice(0, 17) + text.slice(18);
    const r = collapseTokenOnDelete(text, newText);
    expect(r).toEqual({ text: "Hi\nbye", selection: { start: 2, end: 2 } });
  });

  it("токен, прижатый к тексту, удаляется без соседних символов", () => {
    const text = "a{{CLIENT_NAME}}b";
    const newText = text.slice(0, 15) + text.slice(16);
    const r = collapseTokenOnDelete(text, newText);
    expect(r).toEqual({ text: "ab", selection: { start: 1, end: 1 } });
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

  it("курсор внутри закрытого токена — триггера нет", () => {
    const text = "Hi {{CLIENT_NAME}} bye";
    expect(getActiveTokenTrigger(text, 5)).toBeNull();
    expect(getActiveTokenTrigger(text, 10)).toBeNull();
    expect(getActiveTokenTrigger(text, 16)).toBeNull();
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

describe("snapSelectionToTokens", () => {
  const text = "Hi {{CLIENT_NAME}} bye {{DATE_SERVICE}}";

  it("курсор ближе к концу токена переносится за него", () => {
    expect(snapSelectionToTokens(text, { start: 16, end: 16 })).toEqual({
      start: 18,
      end: 18,
    });
  });

  it("курсор ближе к началу токена переносится перед ним", () => {
    expect(snapSelectionToTokens(text, { start: 5, end: 5 })).toEqual({
      start: 3,
      end: 3,
    });
  });

  it("курсор на границах и вне токенов не двигается", () => {
    for (const caret of [3, 18, 20]) {
      expect(snapSelectionToTokens(text, { start: caret, end: caret })).toEqual(
        { start: caret, end: caret },
      );
    }
  });

  it("выделение, задевающее половину токена, расширяется до его границ", () => {
    expect(snapSelectionToTokens(text, { start: 1, end: 8 })).toEqual({
      start: 1,
      end: 18,
    });
    expect(snapSelectionToTokens(text, { start: 8, end: 20 })).toEqual({
      start: 3,
      end: 20,
    });
  });

  it("выделение от одного токена до другого захватывает оба целиком", () => {
    expect(snapSelectionToTokens(text, { start: 8, end: 30 })).toEqual({
      start: 3,
      end: 39,
    });
  });

  it("незакрытые скобки не считаются токеном", () => {
    expect(snapSelectionToTokens("Hi {{CLIENT", { start: 6, end: 6 })).toEqual({
      start: 6,
      end: 6,
    });
  });
});

describe("moveInsertionOutOfToken", () => {
  const text = "Hi {{CLIENT_NAME}} bye";

  it("буква перед закрывающими скобками уходит за токен", () => {
    const newText = text.slice(0, 16) + "z" + text.slice(16);
    expect(moveInsertionOutOfToken(text, newText)).toEqual({
      text: "Hi {{CLIENT_NAME}}z bye",
      selection: { start: 19, end: 19 },
    });
  });

  it("буква после открывающих скобок уходит перед токен", () => {
    const newText = text.slice(0, 5) + "z" + text.slice(5);
    expect(moveInsertionOutOfToken(text, newText)).toEqual({
      text: "Hi z{{CLIENT_NAME}} bye",
      selection: { start: 4, end: 4 },
    });
  });

  it("вставка нескольких символов переносится целиком", () => {
    const newText = text.slice(0, 15) + "abc" + text.slice(15);
    expect(moveInsertionOutOfToken(text, newText)).toEqual({
      text: "Hi {{CLIENT_NAME}}abc bye",
      selection: { start: 21, end: 21 },
    });
  });

  it("ввод вне токена не трогается", () => {
    const newText = text + "!";
    expect(moveInsertionOutOfToken(text, newText)).toBeNull();
  });

  it("ввод на границе токена не трогается", () => {
    const newText = text.slice(0, 18) + "z" + text.slice(18);
    expect(moveInsertionOutOfToken(text, newText)).toBeNull();
  });

  it("удаление и замена не трогаются", () => {
    expect(moveInsertionOutOfToken(text, text.slice(1))).toBeNull();
    expect(moveInsertionOutOfToken(text, "Ho {{CLIENT_NAME}} byee")).toBeNull();
  });
});
