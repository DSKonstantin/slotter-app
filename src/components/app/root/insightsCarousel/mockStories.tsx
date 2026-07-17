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
        source={require("@/assets/images/history/training/one.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/four.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/five.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "6",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/training/six.png")}
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
        source={require("@/assets/images/history/fill_profile/one.png")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/fill_profile/four.png")}
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
        source={require("@/assets/images/history/finances/one.png")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/four.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "5",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/finances/five.png")}
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
        source={require("@/assets/images/history/notification/one.png")}
      />
    ),
  },
  {
    id: "2",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/two.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "3",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/three.png")}
        paddingTop={60}
      />
    ),
  },
  {
    id: "4",
    customScreen: (
      <ImageStoryScreen
        source={require("@/assets/images/history/notification/four.png")}
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
