import type { StoryCategory, Story } from "./NotificationStoriesModal";
import type { InsightCategory } from "./InsightCard";

type StoriesData = Partial<Record<StoryCategory, Story[]>>;

export type InsightCategoryConfig = {
  label: string;
  color: string;
  show: boolean;
};

export const INSIGHT_CATEGORY_CONFIG: Record<
  InsightCategory,
  InsightCategoryConfig
> = {
  analytics: { label: "Аналитика", color: "#0088FF", show: false },
  tip: { label: "Совет", color: "#CB30E0", show: true },
  reminder: { label: "Напоминание", color: "#FF8D28", show: true },
  update: { label: "Обновление", color: "#C8F660", show: true },
  offer: { label: "Предложение", color: "#6155F5", show: true },
  event: { label: "Новое событие", color: "#00C8B3", show: true },
};

export const MOCK_NOTIFICATION_STORIES: Record<string, StoriesData> = {
  "analytics-best-month": {
    training: [
      {
        id: "1",
        category: "training",
        iconName: "Book_fill",
        title: "Как анализировать метрики",
        description: "Сосредоточьтесь на ключевых показателях эффективности",
      },
      {
        id: "2",
        category: "training",
        iconName: "Book_fill",
        title: "5 способов увеличить конверсию",
        description: "Протестируйте А/Б на малых сегментах",
      },
      {
        id: "3",
        category: "training",
        iconName: "Book_fill",
        title: "Интерпретация данных",
        description: "Узнайте как читать графики и делать правильные выводы",
      },
    ],
    account: [
      {
        id: "1",
        category: "account",
        iconName: "User_fill",
        title: "Заполните профиль полностью",
        description: "Клиенты видят вашу информацию — верный первый шаг",
      },
    ],
    schedule: [
      {
        id: "1",
        category: "schedule",
        iconName: "Calendar_fill",
        title: "Оптимизируйте расписание",
        description: "Добавьте перерывы в пиковые часы спроса",
      },
    ],
    services: [
      {
        id: "1",
        category: "services",
        iconName: "Briefcase_fill",
        title: "Добавьте услуги премиум",
        description: "Клиенты ищут всё больше персонализации",
      },
    ],
    events: [],
    finance: [
      {
        id: "1",
        category: "finance",
        iconName: "Wallet_fill",
        title: "Ваша выручка выросла на 37%",
        description: "Это рекорд за всё время работы в приложении",
      },
      {
        id: "2",
        category: "finance",
        iconName: "Wallet_fill",
        title: "Оптимизируйте комиссии платежей",
        description: "Выберите оптимальную схему для вашего бизнеса",
      },
    ],
  },
  "tip-breaks": {
    training: [
      {
        id: "1",
        category: "training",
        iconName: "Book_fill",
        title: "Как правильно настроить перерывы",
        description: "Установите перерывы длительностью 15-30 минут",
      },
      {
        id: "2",
        category: "training",
        iconName: "Book_fill",
        title: "Влияние перерывов на отмены",
        description: "Правильные перерывы снижают отмены на 18%",
      },
    ],
    schedule: [
      {
        id: "1",
        category: "schedule",
        iconName: "Calendar_fill",
        title: "Настройки перерывов в расписании",
        description: "Перейдите в график → Добавить перерыв",
      },
      {
        id: "2",
        category: "schedule",
        iconName: "Calendar_fill",
        title: "Примеры удачных расписаний",
        description: "Смотрите как организуют время коллеги",
      },
    ],
  },
  "reminder-prices": {
    training: [
      {
        id: "1",
        category: "training",
        iconName: "Book_fill",
        title: "Значение цены в объявлении",
        description: "Клиенты с указанной ценой конвертируют лучше на 32%",
      },
    ],
    services: [
      {
        id: "1",
        category: "services",
        iconName: "Briefcase_fill",
        title: "Как добавить цены услуг",
        description: "Зайдите в Услуги → Редактировать → Цена",
      },
      {
        id: "2",
        category: "services",
        iconName: "Briefcase_fill",
        title: "Стратегия ценообразования",
        description: "Анализируйте цены конкурентов в вашей категории",
      },
    ],
  },
};
