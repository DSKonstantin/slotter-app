import React, { useCallback, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { SCREEN_PADDING } from "@/src/constants/layout";

import InsightCard, { type InsightCategory } from "./InsightCard";
import NotificationStoriesModal, {
  type Story,
} from "./NotificationStoriesModal";
import { MOCK_NOTIFICATION_STORIES } from "./mockStories";

type Insight = {
  id: number | string;
  category: InsightCategory;
  title: string;
  imageSource?: number;
  stories?: Story[];
  onPress: () => void;
};

const getMockInsights = (onStoryPress: (id: string) => void): Insight[] => [
  {
    id: "education_payments",
    category: "education",
    title: "Как работать с приложением",
    imageSource: require("@/assets/images/history/carousel/1.webp"),
    stories: MOCK_NOTIFICATION_STORIES["education_payments"],
    onPress: () => onStoryPress("education_payments"),
  },
  {
    id: "app_update",
    category: "update",
    title: "Slotter стал проще и гибче",
    imageSource: require("@/assets/images/history/carousel/5.png"),
    stories: MOCK_NOTIFICATION_STORIES["app_update"],
    onPress: () => onStoryPress("app_update"),
  },
  {
    id: "fill_profile",
    category: "tip",
    title: "Почему важно заполнять профиль",
    imageSource: require("@/assets/images/history/carousel/4.webp"),
    stories: MOCK_NOTIFICATION_STORIES["fill_profile"],
    onPress: () => onStoryPress("fill_profile"),
  },
  {
    id: "finances",
    category: "tip",
    title: "Начинаем считать деньги",
    imageSource: require("@/assets/images/history/carousel/2.webp"),
    stories: MOCK_NOTIFICATION_STORIES["finances"],
    onPress: () => onStoryPress("finances"),
  },
  {
    id: "notification",
    category: "tip",
    title: "Как отправлять уведомление клиентам",
    imageSource: require("@/assets/images/history/carousel/3.webp"),
    stories: MOCK_NOTIFICATION_STORIES["notification"],
    onPress: () => onStoryPress("notification"),
  },
];

const InsightsCarousel = () => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const insights = useMemo(() => getMockInsights(setSelectedStoryId), []);

  const storyGroups = useMemo(
    () =>
      insights
        .filter((i) => i.stories?.length)
        .map((i) => ({ id: String(i.id), stories: i.stories! })),
    [insights],
  );

  const handleCloseStories = useCallback(() => {
    setSelectedStoryId(null);
  }, []);

  if (!insights.length) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          gap: 8,
        }}
      >
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            category={insight.category}
            title={insight.title}
            imageSource={insight.imageSource}
            onPress={insight.onPress}
          />
        ))}
      </ScrollView>

      <NotificationStoriesModal
        isVisible={selectedStoryId !== null}
        onClose={handleCloseStories}
        groups={storyGroups}
        initialGroupId={selectedStoryId ?? undefined}
      />
    </>
  );
};

export default InsightsCarousel;
