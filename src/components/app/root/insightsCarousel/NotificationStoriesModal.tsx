import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type StoryCategory =
  | "training"
  | "account"
  | "schedule"
  | "services"
  | "events"
  | "finance"
  | "notification";

export type Story = {
  id: string;
  category: StoryCategory;
  customScreen: React.ReactNode | ((onNext: () => void) => React.ReactNode);
};

export type StoriesData = Record<StoryCategory, Story[]>;

const SWIPE_THRESHOLD = 40;

type Props = {
  isVisible: boolean;
  onClose: () => void;
  stories: Partial<StoriesData>;
};

const NotificationStoriesModal = ({ isVisible, onClose, stories }: Props) => {
  const [storyIndex, setStoryIndex] = useState(0);

  const opacity = useRef(new Animated.Value(0)).current;
  const storyIndexRef = useRef(storyIndex);
  const allStoriesLengthRef = useRef(0);

  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const allStories = useMemo(
    () =>
      Object.entries(stories).flatMap(([cat, storyList]) =>
        storyList.map((story) => ({ category: cat as StoryCategory, story })),
      ),
    [stories],
  );

  const handleSwipe = useCallback((direction: "left" | "right") => {
    const len = allStoriesLengthRef.current;
    if (len < 2) return;
    const idx = storyIndexRef.current;
    setStoryIndex(
      direction === "right" ? (idx === 0 ? len - 1 : idx - 1) : (idx + 1) % len,
    );
  }, []);

  const handleAnimateIn = useCallback(() => {
    setStoryIndex(0);
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const handleClose = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [opacity, onClose]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .runOnJS(true)
        .onEnd((event) => {
          if (event.translationX > SWIPE_THRESHOLD) handleSwipe("right");
          else if (event.translationX < -SWIPE_THRESHOLD) handleSwipe("left");
        }),
    [handleSwipe],
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd((event) => {
          if (event.y < top + 80) return;
          if (event.x > width / 2) handleSwipe("left");
          else handleSwipe("right");
        }),
    [handleSwipe, width, top],
  );

  const composedGesture = useMemo(
    () => Gesture.Exclusive(panGesture, tapGesture),
    [panGesture, tapGesture],
  );

  storyIndexRef.current = storyIndex;
  allStoriesLengthRef.current = allStories.length;

  if (!allStories.length) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onShow={handleAnimateIn}
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView className="flex-1">
        <Animated.View
          className="flex-1 bg-background-surface"
          style={{ opacity }}
        >
          <GestureDetector gesture={composedGesture}>
            <View className="flex-1">
              <View className="flex-1">
                {allStories.map(({ story }, idx) => (
                  <View
                    key={story.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: idx === storyIndex ? 1 : 0,
                    }}
                    pointerEvents={idx === storyIndex ? "box-none" : "none"}
                  >
                    {typeof story.customScreen === "function"
                      ? story.customScreen(() => handleSwipe("left"))
                      : story.customScreen}
                  </View>
                ))}
              </View>

              <LinearGradient
                colors={[
                  `${colors.neutral[400]}99`,
                  `${colors.neutral[400]}00`,
                ]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 200,
                }}
                pointerEvents="box-none"
              >
                <View
                  className="px-screen gap-4 items-end"
                  style={{ paddingTop: top + 8 }}
                >
                  <View className="flex-1 flex-row gap-1">
                    {allStories.map((_, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => setStoryIndex(idx)}
                        className="flex-1 active:opacity-70"
                      >
                        <View className="h-1.5 bg-neutral-300 rounded-full overflow-hidden">
                          {idx <= storyIndex && (
                            <View className="h-full bg-neutral-0" />
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>

                  <Pressable
                    onPress={handleClose}
                    hitSlop={8}
                    className="active:opacity-70"
                  >
                    <View className="bg-neutral-300 rounded-full p-2">
                      <StSvg
                        name="Close_round"
                        size={24}
                        color={colors.background.surface}
                      />
                    </View>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          </GestureDetector>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default NotificationStoriesModal;
