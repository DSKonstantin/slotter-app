import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Modal, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type StoryCategory =
  | "training"
  | "account"
  | "schedule"
  | "services"
  | "events"
  | "finance";

export type Story = {
  id: string;
  category: StoryCategory;
  iconName?: string;
  title: string;
  description?: string;
  image?: string;
};

export type StoriesData = Record<StoryCategory, Story[]>;

export const CATEGORY_ICONS: Record<StoryCategory, string> = {
  training: "Book_fill",
  account: "User_fill",
  schedule: "Calendar_fill",
  services: "Briefcase_fill",
  events: "Clock_fill",
  finance: "Wallet_fill",
};

export const CATEGORY_COLORS: Record<StoryCategory, string> = {
  training: colors.accent.purple[500],
  account: colors.primary.blue[500],
  schedule: colors.primary.green[500],
  services: colors.accent.orange[500],
  events: colors.accent.mint[500],
  finance: colors.accent.indigo[500],
};

export const CATEGORY_NAMES: Record<StoryCategory, string> = {
  training: "Обучение",
  account: "Аккаунт",
  schedule: "График",
  services: "Услуги",
  events: "События",
  finance: "Финансы",
};

const SWIPE_THRESHOLD = 40;

type Props = {
  isVisible: boolean;
  onClose: () => void;
  stories: Partial<StoriesData>;
  notificationLabel?: string;
  notificationIcon?: string;
  notificationColor?: string;
  showIcon?: boolean;
};

const NotificationStoriesModal = ({
  isVisible,
  onClose,
  stories,
  notificationLabel,
  notificationIcon,
  notificationColor,
  showIcon = true,
}: Props) => {
  const { top } = useSafeAreaInsets();
  const [storyIndex, setStoryIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;

  const allStories = useMemo(() => {
    const flat: { category: StoryCategory; story: Story }[] = [];
    Object.entries(stories).forEach(([cat, storyList]) => {
      storyList.forEach((story) => {
        flat.push({ category: cat as StoryCategory, story });
      });
    });
    return flat;
  }, [stories]);

  const currentIndex = storyIndex;
  const currentStoryData = allStories[currentIndex];
  const currentCategory = currentStoryData?.category || "training";
  const currentStory = currentStoryData?.story;
  const safeStoryIndex = Math.min(
    currentIndex,
    Math.max(0, allStories.length - 1),
  );

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (allStories.length < 2) return;

      if (direction === "right") {
        const nextIndex =
          safeStoryIndex === 0 ? allStories.length - 1 : safeStoryIndex - 1;
        setStoryIndex(nextIndex);
      } else {
        const nextIndex = (safeStoryIndex + 1) % allStories.length;
        setStoryIndex(nextIndex);
      }
    },
    [allStories.length, safeStoryIndex],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .runOnJS(true)
        .onEnd((event) => {
          if (event.translationX > SWIPE_THRESHOLD) {
            handleSwipe("right");
          } else if (event.translationX < -SWIPE_THRESHOLD) {
            handleSwipe("left");
          }
        }),
    [handleSwipe],
  );

  const handleAnimateIn = () => {
    setStoryIndex(0);
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!currentStory) return null;

  const displayColor =
    notificationColor !== undefined
      ? notificationColor
      : CATEGORY_COLORS[currentCategory];
  const displayIcon = notificationIcon || CATEGORY_ICONS[currentCategory];
  const displayLabel = notificationLabel || CATEGORY_NAMES[currentCategory];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onShow={handleAnimateIn}
      onRequestClose={handleClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.background.surface,
          opacity,
        }}
      >
        <GestureDetector gesture={panGesture}>
          <View style={{ flex: 1 }}>
            <LinearGradient
              colors={["#B0B0B099", "#B0B0B000"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 200,
                pointerEvents: "none",
              }}
            />

            <View style={{ paddingTop: top + 16, paddingHorizontal: 16 }}>
              <View className="flex-row gap-1">
                {allStories.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setStoryIndex(idx)}
                    activeOpacity={0.7}
                    className="flex-1"
                  >
                    <View className="h-1.5 bg-neutral-300 rounded-full overflow-hidden">
                      {idx <= currentIndex && (
                        <View className="h-full bg-neutral-0" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row items-center gap-3 pl-6 pb-6 pt-6">
              {showIcon && (
                <View
                  className="rounded-full p-2"
                  style={{ backgroundColor: displayColor }}
                >
                  <StSvg name={displayIcon} size={20} color={colors.neutral[0]} />
                </View>
              )}
              <View className="gap-1">
                <Typography className="text-caption text-neutral-500">
                  {displayLabel}
                </Typography>
              </View>
              <View className="flex-1" />
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={8}
                className="active:opacity-70 pr-2"
              >
                <View className="bg-neutral-300 rounded-full p-2">
                  <StSvg
                    name="Close_round"
                    size={24}
                    color={colors.background.surface}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center px-6">
              <View className="gap-6">
                <Typography
                  weight="semibold"
                  className="text-4xl text-neutral-900"
                  numberOfLines={5}
                >
                  {currentStory.title}
                </Typography>

                {currentStory.description && (
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-500"
                    numberOfLines={3}
                  >
                    {currentStory.description}
                  </Typography>
                )}
              </View>
            </View>
          </View>
        </GestureDetector>
      </Animated.View>
    </Modal>
  );
};

export default NotificationStoriesModal;
