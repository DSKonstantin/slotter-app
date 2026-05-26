import React from "react";
import type { StoryCategory, Story } from "./NotificationStoriesModal";
import type { InsightCategory } from "./InsightCard";
import ScheduleStoryScreen from "./screens/ScheduleStoryScreen";
import FinanceStoryScreen from "./screens/FinanceStoryScreen";
import ServicesStoryScreen from "./screens/ServicesStoryScreen";
import AccountStoryScreen from "./screens/AccountStoryScreen";
import EventsStoryScreen from "./screens/EventsStoryScreen";
import PreviewAdviceScreen from "./screens/PreviewAdviceScreen";

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
  analytics: { label: "Аналитика", color: "#0088FF", show: true },
  education: { label: "Обучение", color: "#C8F660", show: true },
  tip: { label: "Совет", color: "#CB30E0", show: true },
  reminder: { label: "Напоминание", color: "#FF8D28", show: true },
  update: { label: "Обновление", color: "#C8F660", show: true },
  offer: { label: "Предложение", color: "#6155F5", show: true },
  event: { label: "Новое событие", color: "#00C8B3", show: true },
};

export const MOCK_NOTIFICATION_STORIES: Record<string, StoriesData> = {
  "tip-breaks": {
    // training: [
    //   {
    //     id: "1",
    //     category: "training",
    //     customScreen: (onNext: () => void) =>
    //       React.createElement(PreviewAdviceScreen, { onNext }),
    //   },
    //   {
    //     id: "2",
    //     category: "training",
    //     customScreen: React.createElement(ScheduleStoryScreen),
    //   },
    //   {
    //     id: "3",
    //     category: "training",
    //     customScreen: React.createElement(FinanceStoryScreen),
    //   },
    //   {
    //     id: "4",
    //     category: "training",
    //     customScreen: React.createElement(ServicesStoryScreen),
    //   },
    //   {
    //     id: "5",
    //     category: "training",
    //     customScreen: React.createElement(AccountStoryScreen),
    //   },
    //   {
    //     id: "6",
    //     category: "training",
    //     customScreen: React.createElement(EventsStoryScreen),
    //   },
    // ],
  },
  "education-payments": {
    training: [
      {
        id: "1",
        category: "training",
        customScreen: (onNext: () => void) =>
          React.createElement(PreviewAdviceScreen, { onNext }),
      },
      {
        id: "2",
        category: "training",
        customScreen: React.createElement(ScheduleStoryScreen),
      },
      {
        id: "3",
        category: "training",
        customScreen: React.createElement(FinanceStoryScreen),
      },
      {
        id: "4",
        category: "training",
        customScreen: React.createElement(ServicesStoryScreen),
      },
      {
        id: "5",
        category: "training",
        customScreen: React.createElement(AccountStoryScreen),
      },
      {
        id: "6",
        category: "training",
        customScreen: React.createElement(EventsStoryScreen),
      },
    ],
  },
};
