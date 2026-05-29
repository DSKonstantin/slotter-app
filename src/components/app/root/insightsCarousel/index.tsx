import React, { useCallback, useMemo, useRef, useState } from "react";
import usePersistentStorage from "@/src/hooks/usePersistentStorage";
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

type Insight = {
  id: number | string;
  category: InsightCategory;
  iconName: string;
  title: string;
  body: BodyPart[] | string;
  dismissable?: boolean;
  stories?: Partial<StoriesData>;
  onPress: () => void;
};

// TODO: заменить на useGetInsightsQuery({ userId }) когда появится бэк
// TODO: заменить на useGetNotificationStoriesQuery({ notificationId }) когда появится бэк
const getMockInsights = (onStoryPress: (id: string) => void): Insight[] => [
  {
    id: "analytics-best-month",
    category: "analytics",
    iconName: "Chart_alt_fill",
    title: "Лучший месяц — выручка +37%",
    body: "Февраль стал рекордным за всё время",
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["analytics-best-month"],

    onPress: () => onStoryPress("analytics-best-month"),
  },
  {
    id: "education-payments",
    category: "education",
    iconName: "Star_alt_fill",
    title: "Как работать с приложением",
    body: [{ text: "Изучите основные разделы для работы" }],
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["education-payments"],
    onPress: () => onStoryPress("education-payments"),
  },
  {
    id: "tip-breaks",
    category: "tip",
    iconName: "Lamp_fill",
    title: "Настройте перерывы в расписании",
    body: [
      { text: "Снизьте число отмен на " },
      { text: "18%", highlight: true },
    ],
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["tip-breaks"],
    onPress: () => onStoryPress("tip-breaks"),
  },
  {
    id: "reminder-prices",
    category: "reminder",
    iconName: "Bell_pin_fill",
    title: "Заполните прайс",
    body: "Клиенты не видят стоимость услуг — это снижает конверсию в запись",
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["reminder-prices"],
    onPress: () => onStoryPress("reminder-prices"),
  },
  {
    id: "update-payments",
    category: "update",
    iconName: "slotter_fill",
    title: "Оплата теперь в 2× быстрее",
    body: [
      { text: "Конверсия в оплату выросла на " },
      { text: "22%", highlight: true },
    ],
    dismissable: true,
    stories: {},
    onPress: () => onStoryPress("update-payments"),
  },
  {
    id: "offer-payments",
    category: "offer",
    iconName: "Star_fill",
    title: "Продлите подписку со скидкой 20%",
    body: [
      { text: "Акция до " },
      { text: "пятницы ", highlight: true },
      { text: "экономия 480 ₽ на 3 месяца" },
    ],
    dismissable: true,
    stories: {},
    onPress: () => onStoryPress("offer-payments"),
  },
  {
    id: "offer-referral",
    category: "offer",
    iconName: "Star_fill",
    title: "Давай зарабатывать вместе!",
    body: [
      {
        text: "Рекомендуй приложение коллегам и получай до 50% с первой оплаты. ",
      },
      { text: "Подробнее...", highlight: true },
    ],
    dismissable: true,
    stories: {},
    onPress: () => onStoryPress("offer-referral"),
  },
  {
    id: "event-new",
    category: "event",
    iconName: "Status",
    title: "У вас не прочитано 2 события",
    body: "Советуем просмотреть, прежде чем событие станет неактуальным",
    dismissable: true,
    stories: {},
    onPress: () => onStoryPress("event-new"),
  },
];

const InsightsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  const [dismissedIds, setDismissedIds] = usePersistentStorage<
    (string | number)[]
  >("insights_dismissed", []);

  const dismissed = useMemo(() => new Set(dismissedIds), [dismissedIds]);

  const handleStoryPress = useCallback((id: string) => {
    setSelectedStoryId(id);
  }, []);

  const handleCloseStories = useCallback(() => {
    setSelectedStoryId(null);
  }, []);

  const insights = useMemo(
    () => getMockInsights(handleStoryPress).filter((i) => !dismissed.has(i.id)),
    [dismissed, handleStoryPress],
  );

  const safeIndex = Math.min(index, Math.max(0, insights.length - 1));
  const current = safeIndex >= 0 ? insights[safeIndex] : null;

  const selectedInsight = useMemo(
    () => insights.find((i) => i.id === selectedStoryId) ?? null,
    [insights, selectedStoryId],
  );

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

  const safeIndexRef = useRef(safeIndex);
  const insightsLengthRef = useRef(insights.length);
  safeIndexRef.current = safeIndex;
  insightsLengthRef.current = insights.length;

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

  const currentRef = useRef(current);
  currentRef.current = current;

  const handleDismiss = useCallback(() => {
    setDismissedIds((prev) => [...prev, currentRef.current!.id]);
    setIndex(0);
  }, [setDismissedIds]);

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
            onDismiss={current.dismissable ? handleDismiss : undefined}
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
          stories={selectedInsight.stories ?? {}}
        />
      )}
    </>
  );
};

export default InsightsCarousel;
