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
        source={require("@/assets/images/history/training/one.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "2",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/four.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/five.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "6",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/training/six.png")}
        paddingTop={60}
      />
    ),
  },
];

const FILL_PROFILE_STORIES: Story[] = [
  {
    id: "1",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/fill_profile/one.png")}
      />
    ),
  },
  {
    id: "2",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/fill_profile/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/fill_profile/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/fill_profile/four.png")}
        paddingTop={60}
      />
    ),
  },
];

const FINANCES_STORIES: Story[] = [
  {
    id: "1",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/finances/one.png")}
      />
    ),
  },
  {
    id: "2",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/finances/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/finances/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/finances/four.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    category: "training",
    customScreen: (
      <TrainingScreen
        source={require("@/assets/images/history/finances/five.png")}
        paddingTop={60}
      />
    ),
  },
];

export const MOCK_NOTIFICATION_STORIES: Record<string, StoriesData> = {
  "education-payments": {
    training: TRAINING_STORIES,
  },
  fill_profile: {
    training: FILL_PROFILE_STORIES,
  },

  finances: {
    training: FINANCES_STORIES,
  },
};
