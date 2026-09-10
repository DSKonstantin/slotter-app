import {
  ALL_TEMPLATE_VARIABLES,
  type TemplateVariable,
} from "./templateVariables";

export type TemplateKind = "reminder" | "reschedule";

export type TemplatePreviewChannel = "telegram" | "max" | "bot";

export type MessageTemplateConfig = {
  variables: TemplateVariable[];
  defaultText: string;
  maxLength: number;
  preview: {
    channel: TemplatePreviewChannel;
    senderName: string;
    time: string;
  };
};

const DEFAULT_PREVIEW = {
  channel: "telegram" as const,
  senderName: "Ваше имя",
  time: "15:02",
};

export const TEMPLATE_CONFIGS: Record<TemplateKind, MessageTemplateConfig> = {
  reminder: {
    variables: ALL_TEMPLATE_VARIABLES,
    defaultText:
      "{{client_name}}, напоминаем вам о визите {{date}} в {{time}}.",
    maxLength: 500,
    preview: DEFAULT_PREVIEW,
  },
  reschedule: {
    variables: ALL_TEMPLATE_VARIABLES,
    defaultText:
      "{{client_name}}, ваша запись перенесена на {{date}} в {{time}}.",
    maxLength: 500,
    preview: DEFAULT_PREVIEW,
  },
};

export const isTemplateKind = (value: string): value is TemplateKind =>
  value === "reminder" || value === "reschedule";
