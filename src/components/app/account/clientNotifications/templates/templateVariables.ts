export type TemplateVariable = {
  token: string;
  label: string;
  sample: string;
};

export const TEMPLATE_VARIABLES = {
  client_name: {
    token: "{{client_name}}",
    label: "Имя клиента",
    sample: "Анна",
  },
  master_name: {
    token: "{{master_name}}",
    label: "Имя специалиста",
    sample: "Мария",
  },
  master_phone: {
    token: "{{master_phone}}",
    label: "Телефон специалиста",
    sample: "+7 900 000-00-00",
  },
  date: {
    token: "{{date}}",
    label: "Дата записи",
    sample: "14 мая",
  },
  time: {
    token: "{{time}}",
    label: "Время записи",
    sample: "15:00",
  },
  service: {
    token: "{{service}}",
    label: "Название услуги",
    sample: "Стрижка",
  },
  address: {
    token: "{{address}}",
    label: "Адрес",
    sample: "ул. Пушкина, 10",
  },
} as const satisfies Record<string, TemplateVariable>;

export const ALL_TEMPLATE_VARIABLES: TemplateVariable[] =
  Object.values(TEMPLATE_VARIABLES);
