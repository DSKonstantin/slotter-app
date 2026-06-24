import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Carousel, {
  type ICarouselInstance,
} from "react-native-reanimated-carousel";

import { PaginationDots } from "@/src/components/ui";

import InsightCard, {
  type InsightCategory,
  type BodyPart,
} from "./InsightCard";
import NotificationStoriesModal, {
  type StoriesData,
} from "./NotificationStoriesModal";
import { MOCK_NOTIFICATION_STORIES } from "./mockStories";

const EMPTY_STORIES: Partial<StoriesData> = {};
const AUTO_PLAY_INTERVAL = 4000;

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
  {
    id: "notification",
    category: "tip",
    iconName: "Lamp_fill",
    title: "Как отправлять уведомление клиентам",
    body: [{ text: "От бесплатных до платных каналов отправки" }],
    stories: MOCK_NOTIFICATION_STORIES["notification"],
    onPress: () => onStoryPress("notification"),
  },
];

const InsightsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const isScrollingRef = useRef(false);
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width: screenWidth } = useWindowDimensions();

  const insights = useMemo(() => getMockInsights(setSelectedStoryId), []);

  const selectedInsight = useMemo(
    () => insights.find((i) => i.id === selectedStoryId) ?? null,
    [insights, selectedStoryId],
  );

  const handleCloseStories = useCallback(() => {
    setSelectedStoryId(null);
  }, []);

  const handleDotSelect = useCallback((i: number) => {
    setIndex(i);
    carouselRef.current?.scrollTo({ index: i, animated: true });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Insight }) => (
      <View className="px-screen">
        <InsightCard
          category={item.category}
          iconName={item.iconName}
          title={item.title}
          body={item.body}
          onPress={() => {
            if (!isScrollingRef.current) item.onPress();
          }}
        />
      </View>
    ),
    [],
  );

  if (!insights.length) return null;

  return (
    <>
      <View className="gap-2.5">
        <Carousel
          ref={carouselRef}
          data={insights}
          renderItem={renderItem}
          width={screenWidth}
          height={132}
          loop
          autoPlay
          autoPlayInterval={AUTO_PLAY_INTERVAL}
          onScrollStart={() => {
            isScrollingRef.current = true;
          }}
          onScrollEnd={() => {
            isScrollingRef.current = false;
          }}
          onSnapToItem={(rawIndex) =>
            setIndex(
              ((rawIndex % insights.length) + insights.length) %
                insights.length,
            )
          }
        />

        {insights.length > 1 && (
          <View className="items-center">
            <PaginationDots
              count={insights.length}
              activeIndex={index}
              onSelect={handleDotSelect}
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
