import React from "react";
import type { StoryCategory, Story } from "./NotificationStoriesModal";

import TrainingScreen from "./screens/training/TrainingScreen";

export { INSIGHT_CATEGORY_CONFIG } from "./config";
export type { InsightCategoryConfig } from "./config";

type StoriesData = Partial<Record<StoryCategory, Story[]>>;

const TRAINING_STORIES: Story[] = [
  {
    id: "1",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/education.png")}
      />
    ),
  },
  {
    id: "2",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/schedule.png")}
      />
    ),
  },
  {
    id: "3",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/finance.png")}
      />
    ),
  },
  {
    id: "4",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/services.png")}
      />
    ),
  },
  {
    id: "5",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/account.png")}
      />
    ),
  },
  {
    id: "6",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/event_log.png")}
      />
    ),
  },
];

export const MOCK_NOTIFICATION_STORIES: Record<string, StoriesData> = {
  "tip-breaks": {},
  "education-payments": {
    training: TRAINING_STORIES,
  },
};
