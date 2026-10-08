import type { ComponentProps } from "react";
import type { StSvg } from "@/src/components/ui";
import type {
  ConfirmCodeMethod,
  SendCodeMethod,
  SendCodeResponse,
} from "@/src/store/redux/services/api-types";

export type CodeMethodId = Extract<SendCodeMethod, "flashcall" | "telegram">;

export type CodeSession = {
  link: string;
};

type CodeMethodConfig = {
  defaultCodeLength: number;
  fallbackDelayMs: number;
  confirmMethod?: ConfirmCodeMethod;
  resendLabel?: string;
  title: (codeLength: number) => string;
  subtitle: (codeLength: number, phone: string) => string;
  fallbackHint: string;
  expiredText: string;
  link?: {
    title: string;
    icon: ComponentProps<typeof StSvg>["name"];
    openError: string;
  };
  unavailableText: string;
  errors: Record<string, string>;
};

export const CODE_METHODS: Record<CodeMethodId, CodeMethodConfig> = {
  flashcall: {
    defaultCodeLength: 4,
    fallbackDelayMs: 45_000,
    title: (codeLength) => `Введите последние ${codeLength} цифры`,
    subtitle: (codeLength, phone) =>
      `Вам поступит входящий звонок на номер ${phone} — введите последние ${codeLength} цифры номера, с которого звонят`,
    fallbackHint: "Звонок не пришёл? Подтвердите номер звонком",
    expiredText: "Время вышло. Запросите звонок ещё раз",
    unavailableText: "Звонок временно недоступен. Попробуйте позже",
    errors: {
      flashcall_rate_limited:
        "Лимит звонков исчерпан. Попробуйте другой способ",
    },
  },
  telegram: {
    defaultCodeLength: 6,
    fallbackDelayMs: 60_000,
    confirmMethod: "telegram",
    resendLabel: "Отправить заново",
    title: () => "Введите код из Telegram",
    subtitle: (_codeLength, phone) =>
      `Откройте бота, нажмите /start и «Поделиться номером» — код для номера ${phone} придёт туда`,
    fallbackHint: "Не приходит код? Подтвердите номер звонком",
    expiredText: "Код истёк. Отправьте код ещё раз",
    link: {
      title: "Открыть бота в Telegram",
      icon: "SocialTelegram",
      openError: "Не удалось открыть Telegram",
    },
    unavailableText:
      "Вход через Telegram пока недоступен. Подтвердите номер звонком",
    errors: {
      telegram_rate_limited: "Лимит кодов исчерпан. Подтвердите номер звонком",
      telegram_unavailable: "Telegram недоступен. Подтвердите номер звонком",
    },
  },
};

export const resolveCodeMethod = (method?: string): CodeMethodId =>
  method !== undefined &&
  Object.prototype.hasOwnProperty.call(CODE_METHODS, method)
    ? (method as CodeMethodId)
    : "flashcall";

export const toCodeSession = (source: {
  bot_url?: string | null;
}): CodeSession => ({
  link: source.bot_url ?? "",
});

export const codeSessionFromResponse = (
  result: SendCodeResponse,
): CodeSession => toCodeSession(result);
