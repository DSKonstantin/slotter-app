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
import {
  MOCK_NOTIFICATION_STORIES,
  INSIGHT_CATEGORY_CONFIG,
} from "./mockStories";

const SWIPE_THRESHOLD = 40;

type Insight = {
  id: number | string;
  category: InsightCategory;
  iconName: string;
  title: string;
  body: BodyPart[] | string;
  dismissable?: boolean;
  stories?: Partial<StoriesData>;
  notificationLabel?: string;
  onPress: () => void;
};

// TODO: заменить на useGetInsightsQuery({ userId }) когда появится бэк
// TODO: заменить на useGetNotificationStoriesQuery({ notificationId }) когда появится бэк
const getMockInsights = (onStoryPress: (id: string) => void): Insight[] => [
  {
    id: "analytics-best-month",
    category: "analytics",
    iconName: "Line_up",
    title: "Лучший месяц — выручка +37%",
    body: "Февраль стал рекордным за всё время",
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["analytics-best-month"],
    notificationLabel: INSIGHT_CATEGORY_CONFIG.analytics.label,
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
    notificationLabel: INSIGHT_CATEGORY_CONFIG.education.label,
    onPress: () => onStoryPress("education-payments"),
  },
  {
    id: "tip-breaks",
    category: "tip",
    iconName: "Pin_fill",
    title: "Настройте перерывы в расписании",
    body: [
      { text: "Снизьте число отмен на " },
      { text: "18%", highlight: true },
    ],
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["tip-breaks"],
    notificationLabel: INSIGHT_CATEGORY_CONFIG.tip.label,
    onPress: () => onStoryPress("tip-breaks"),
  },
  {
    id: "reminder-prices",
    category: "reminder",
    iconName: "Bell_fill",
    title: "Заполните прайс",
    body: "Клиенты не видят стоимость услуг — это снижает конверсию в запись",
    dismissable: true,
    stories: MOCK_NOTIFICATION_STORIES["reminder-prices"],
    notificationLabel: INSIGHT_CATEGORY_CONFIG.reminder.label,
    onPress: () => onStoryPress("reminder-prices"),
  },
  {
    id: "update-payments",
    category: "update",
    iconName: "Check_round_fill",
    title: "Оплата теперь в 2× быстрее",
    body: [
      { text: "Конверсия в оплату выросла на " },
      { text: "22%", highlight: true },
    ],
    dismissable: true,
    stories: {},
    notificationLabel: INSIGHT_CATEGORY_CONFIG.update.label,
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
    notificationLabel: INSIGHT_CATEGORY_CONFIG.offer.label,
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
    notificationLabel: INSIGHT_CATEGORY_CONFIG.offer.label,
    onPress: () => onStoryPress("offer-referral"),
  },
  {
    id: "event-new",
    category: "event",
    iconName: "Check_round_fill",
    title: "У вас не прочитано 2 события",
    body: "Советуем просмотреть, прежде чем событие станет неактуальным",
    dismissable: true,
    stories: {},
    notificationLabel: INSIGHT_CATEGORY_CONFIG.event.label,
    onPress: () => onStoryPress("event-new"),
  },
];

const InsightsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<Insight["id"]>>(new Set());
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  const handleStoryPress = (id: string) => {
    setSelectedStoryId(id);
  };

  const handleCloseStories = () => {
    setSelectedStoryId(null);
  };

  const insights = useMemo(
    () => getMockInsights(handleStoryPress).filter((i) => !dismissed.has(i.id)),
    [dismissed],
  );

  const safeIndex = Math.min(index, Math.max(0, insights.length - 1));

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
          if (insights.length < 2) return;
          if (gesture.dx > SWIPE_THRESHOLD) {
            animateChange(
              safeIndex === 0 ? insights.length - 1 : safeIndex - 1,
            );
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            animateChange((safeIndex + 1) % insights.length);
          }
        },
      }),
    [animateChange, insights.length, safeIndex],
  );

  if (insights.length === 0) return null;

  const current = insights[safeIndex];
  const selectedInsight = insights.find((i) => i.id === selectedStoryId);

  const handleDismiss = current.dismissable
    ? () => {
        // TODO: dispatchInsightDismiss(current.id) → POST /insights/:id/dismiss
        setDismissed((prev) => {
          const next = new Set(prev);
          next.add(current.id);
          return next;
        });
        setIndex(0);
      }
    : undefined;

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
            onDismiss={handleDismiss}
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
          notificationLabel={selectedInsight.notificationLabel}
          notificationIcon={selectedInsight.iconName}
          notificationColor={
            INSIGHT_CATEGORY_CONFIG[selectedInsight.category].color
          }
          showIcon={INSIGHT_CATEGORY_CONFIG[selectedInsight.category].show}
        />
      )}
    </>
  );
};

export default InsightsCarousel;
