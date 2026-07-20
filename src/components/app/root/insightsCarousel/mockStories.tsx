import React from "react";
import type { Story } from "./NotificationStoriesModal";

import ImageStoryScreen from "./screens/ImageStoryScreen";

export { INSIGHT_CATEGORY_CONFIG } from "./config";
export type { InsightCategoryConfig } from "./config";

const TRAINING_STORIES: Story[] = [
  {
    id: "1",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/one.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/two.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/three.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/four.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/five.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "6",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/six.webp")}
        paddingTop={60}
      />
    ),
  },
];

const FILL_PROFILE_STORIES: Story[] = [
  {
    id: "1",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/one.webp")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/two.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/three.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/four.webp")}
        paddingTop={60}
      />
    ),
  },
];

const FINANCES_STORIES: Story[] = [
  {
    id: "1",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/one.webp")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/two.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/three.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/four.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/five.webp")}
        paddingTop={60}
      />
    ),
  },
];

const NOTIFICATION_STORIES: Story[] = [
  {
    id: "1",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/one.webp")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/two.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/three.webp")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/four.webp")}
        paddingTop={60}
      />
    ),
  },
];

export const MOCK_NOTIFICATION_STORIES: Record<string, Story[]> = {
  "education-payments": TRAINING_STORIES,
  fill_profile: FILL_PROFILE_STORIES,
  finances: FINANCES_STORIES,
  notification: NOTIFICATION_STORIES,
};
