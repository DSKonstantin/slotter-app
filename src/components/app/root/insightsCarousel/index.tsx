import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, View } from "react-native";

import { PaginationDots } from "@/src/components/ui";

import InsightCard, {
  type InsightCategory,
  type BodyPart,
} from "./InsightCard";
import NotificationStoriesModal, {
  type StoriesData,
} from "./NotificationStoriesModal";
import { MOCK_NOTIFICATION_STORIES } from "./mockStories";

const SWIPE_THRESHOLD = 40;
const EMPTY_STORIES: Partial<StoriesData> = {};

type Insight = {
  id: number | string;
  category: InsightCategory;
  iconName: string;
  title: string;
  body: BodyPart[] | string;
  stories?: Partial<StoriesData>;
  onPress: () => void;
};

const getMockInsights = (onStoryPress: (id: string) => void): Insight[] => [
  {
    id: "education-payments",
    category: "education",
    iconName: "Star_alt_fill",
    title: "Как работать с приложением",
    body: [{ text: "Изучите основные разделы для работы" }],
    stories: MOCK_NOTIFICATION_STORIES["education-payments"],
    onPress: () => onStoryPress("education-payments"),
  },
  {
    id: "fill_profile",
    category: "tip",
    iconName: "Lamp_fill",
    title: "Почему важно заполнять профиль",
    body: [{ text: "Немного о конверсии в услугах" }],
    stories: MOCK_NOTIFICATION_STORIES["fill_profile"],
    onPress: () => onStoryPress("fill_profile"),
  },
  {
    id: "finances",
    category: "tip",
    iconName: "Lamp_fill",
    title: "Начинаем считать деньги",
    body: [{ text: "Подготовили необходимые калькуляторы" }],
    stories: MOCK_NOTIFICATION_STORIES["finances"],
    onPress: () => onStoryPress("finances"),
  },
];

const InsightsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;
  const safeIndexRef = useRef(0);
  const insightsLengthRef = useRef(0);

  const insights = useMemo(() => getMockInsights(setSelectedStoryId), []);

  const selectedInsight = useMemo(
    () => insights.find((i) => i.id === selectedStoryId) ?? null,
    [insights, selectedStoryId],
  );

  const handleCloseStories = useCallback(() => {
    setSelectedStoryId(null);
  }, []);

  const animateChange = useCallback(
    (next: number) => {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }).start();
      setIndex(next);
    },
    [opacity],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
        onPanResponderRelease: (_, gesture) => {
          if (insightsLengthRef.current < 2) return;
          if (gesture.dx > SWIPE_THRESHOLD) {
            animateChange(
              safeIndexRef.current === 0
                ? insightsLengthRef.current - 1
                : safeIndexRef.current - 1,
            );
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            animateChange(
              (safeIndexRef.current + 1) % insightsLengthRef.current,
            );
          }
        },
      }),
    [animateChange],
  );

  const safeIndex = Math.min(index, Math.max(0, insights.length - 1));
  const current = safeIndex >= 0 ? insights[safeIndex] : null;
  safeIndexRef.current = safeIndex;
  insightsLengthRef.current = insights.length;

  if (!current) return null;

  return (
    <>
      <View className="gap-2.5" {...panResponder.panHandlers}>
        <Animated.View style={{ opacity }}>
          <InsightCard
            category={current.category}
            iconName={current.iconName}
            title={current.title}
            body={current.body}
            onPress={current.onPress}
          />
        </Animated.View>

        {insights.length > 1 && (
          <View className="items-center">
            <PaginationDots
              count={insights.length}
              activeIndex={safeIndex}
              onSelect={animateChange}
            />
          </View>
        )}
      </View>

      {selectedInsight && (
        <NotificationStoriesModal
          isVisible={selectedStoryId !== null}
          onClose={handleCloseStories}
          stories={selectedInsight.stories ?? EMPTY_STORIES}
        />
      )}
    </>
  );
};

export default InsightsCarousel;
