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
  type Story,
} from "./NotificationStoriesModal";
import { MOCK_NOTIFICATION_STORIES } from "./mockStories";

const AUTO_PLAY_INTERVAL = 6000;
const DEFAULT_CARD_HEIGHT = 132;

type Insight = {
  id: number | string;
  category: InsightCategory;
  iconName: string;
  title: string;
  body: BodyPart[] | string;
  stories?: Story[];
  onPress: () => void;
};

const getMockInsights = (onStoryPress: (id: string) => void): Insight[] => [
  {
    id: "education_payments",
    category: "education",
    iconName: "Star_alt_fill",
    title: "Как работать с приложением",
    body: [{ text: "Изучите основные разделы для работы" }],
    stories: MOCK_NOTIFICATION_STORIES["education_payments"],
    onPress: () => onStoryPress("education_payments"),
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
  const [cardHeight, setCardHeight] = useState(DEFAULT_CARD_HEIGHT);
  const isScrollingRef = useRef(false);
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width: screenWidth } = useWindowDimensions();

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

  const handleDotSelect = useCallback((i: number) => {
    setIndex(i);
    carouselRef.current?.scrollTo({ index: i, animated: true });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Insight }) => (
      <View className="px-screen flex-1">
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
        <View
          pointerEvents="none"
          style={{ position: "absolute", opacity: 0, width: screenWidth }}
        >
          {insights.map((insight) => (
            <View
              key={insight.id}
              className="px-screen"
              onLayout={(e) => {
                const measured = Math.ceil(e.nativeEvent.layout.height);
                setCardHeight((prev) => Math.max(prev, measured));
              }}
            >
              <InsightCard
                category={insight.category}
                iconName={insight.iconName}
                title={insight.title}
                body={insight.body}
                onPress={() => {}}
              />
            </View>
          ))}
        </View>

        <Carousel
          ref={carouselRef}
          data={insights}
          renderItem={renderItem}
          width={screenWidth}
          height={cardHeight}
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
