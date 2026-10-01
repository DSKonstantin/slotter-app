import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

export type Story = {
  id: string;
  customScreen: React.ReactNode | ((onNext: () => void) => React.ReactNode);
};

export type StoryGroup = {
  id: string;
  stories: Story[];
};

const SWIPE_THRESHOLD = 40;
const SWIPE_MIN_DISTANCE = 15;
const SWIPE_VELOCITY = 500;
const CLOSE_THRESHOLD = 100;
const CLOSE_VELOCITY = 800;
const SLIDE_TRANSITION_MS = 250;
const STORY_DURATION_MS = 7000;
const HOLD_TO_PAUSE_MS = 200;

const runStoryTimer = (timer: SharedValue<number>, onDone: () => void) => {
  "worklet";
  timer.value = withTiming(
    1,
    {
      duration: STORY_DURATION_MS * (1 - timer.value),
      easing: Easing.linear,
    },
    (finished) => {
      if (finished) runOnJS(onDone)();
    },
  );
};

const restartStoryTimer = (timer: SharedValue<number>, onDone: () => void) => {
  "worklet";
  timer.value = 0;
  runStoryTimer(timer, onDone);
};

const StoryProgressFill = ({ timer }: { timer: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${timer.value * 100}%`,
  }));

  return (
    <Animated.View
      className="h-full bg-primary-green-500"
      style={animatedStyle}
    />
  );
};

const groupBaseIndex = (groups: StoryGroup[], groupIdx: number) =>
  groups.slice(0, groupIdx).reduce((acc, g) => acc + g.stories.length, 0);

const StorySlide = ({
  index,
  progress,
  width,
  isActive,
  children,
}: {
  index: number;
  progress: SharedValue<number>;
  width: number;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (index - progress.value) * width }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
      pointerEvents={isActive ? "box-none" : "none"}
    >
      {children}
    </Animated.View>
  );
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  groups: StoryGroup[];
  initialGroupId?: string;
};

const NotificationStoriesModal = ({
  isVisible,
  onClose,
  groups,
  initialGroupId,
}: Props) => {
  const [groupIndex, setGroupIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const progress = useSharedValue(0);
  const storyTimer = useSharedValue(0);
  const groupIndexRef = useRef(groupIndex);
  const storyIndexRef = useRef(storyIndex);
  const groupsRef = useRef(groups);
  const autoNextRef = useRef(() => {});

  const { top } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const handleAnimateIn = useCallback(() => {
    const found = groups.findIndex((g) => g.id === initialGroupId);
    const idx = found >= 0 ? found : 0;
    setGroupIndex(idx);
    setStoryIndex(0);
    setReady(true);
    progress.value = groupBaseIndex(groups, idx);
    opacity.value = 0;
    translateY.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [groups, initialGroupId, progress, opacity, translateY]);

  const handleClose = useCallback(() => {
    cancelAnimation(storyTimer);
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  }, [opacity, onClose, storyTimer]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const allGroups = groupsRef.current;
      const groupIdx = groupIndexRef.current;
      const storyIdx = storyIndexRef.current;
      const storiesLen = allGroups[groupIdx]?.stories.length ?? 0;
      const base = groupBaseIndex(allGroups, groupIdx);

      const moveTo = (nextGroup: number, nextStory: number) => {
        groupIndexRef.current = nextGroup;
        storyIndexRef.current = nextStory;
        setGroupIndex(nextGroup);
        setStoryIndex(nextStory);
      };

      const slideTo = (globalIdx: number) => {
        progress.value = withTiming(globalIdx, {
          duration: SLIDE_TRANSITION_MS,
        });
      };

      if (direction === "left") {
        if (storyIdx < storiesLen - 1) {
          moveTo(groupIdx, storyIdx + 1);
          slideTo(base + storyIdx + 1);
        } else if (groupIdx < allGroups.length - 1) {
          moveTo(groupIdx + 1, 0);
          slideTo(base + storiesLen);
        } else {
          handleClose();
        }
      } else {
        if (storyIdx > 0) {
          moveTo(groupIdx, storyIdx - 1);
          slideTo(base + storyIdx - 1);
        } else if (groupIdx > 0) {
          const lastIdx = (allGroups[groupIdx - 1]?.stories.length ?? 1) - 1;
          moveTo(groupIdx - 1, lastIdx);
          slideTo(base - 1);
        }
      }
    },
    [handleClose, progress],
  );

  const handleAutoNext = useCallback(() => {
    const allGroups = groupsRef.current;
    const groupIdx = groupIndexRef.current;
    const isLastStory =
      groupIdx === allGroups.length - 1 &&
      storyIndexRef.current === (allGroups[groupIdx]?.stories.length ?? 0) - 1;
    if (!isLastStory) handleSwipe("left");
  }, [handleSwipe]);

  const onTimerDone = useCallback(() => autoNextRef.current(), []);

  const verticalPan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(15)
        .failOffsetY(-15)
        .failOffsetX([-10, 10])
        .onStart(() => {
          cancelAnimation(storyTimer);
        })
        .onUpdate((event) => {
          if (event.translationY <= 0) return;
          translateY.value = event.translationY;
          opacity.value = Math.max(0, 1 - event.translationY / 300);
        })
        .onEnd((event) => {
          if (
            event.translationY > CLOSE_THRESHOLD ||
            event.velocityY > CLOSE_VELOCITY
          ) {
            opacity.value = withTiming(0, { duration: 250 });
            translateY.value = withTiming(height, { duration: 250 }, () => {
              runOnJS(onClose)();
            });
          } else {
            translateY.value = withSpring(0, {
              damping: 18,
              stiffness: 180,
            });
            opacity.value = withTiming(1, { duration: 200 });
            runStoryTimer(storyTimer, onTimerDone);
          }
        }),
    [translateY, opacity, height, onClose, storyTimer, onTimerDone],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-30, 30])
        .runOnJS(true)
        .onEnd((event) => {
          const back =
            event.translationX > SWIPE_THRESHOLD ||
            (event.translationX > SWIPE_MIN_DISTANCE &&
              event.velocityX > SWIPE_VELOCITY);
          const forward =
            event.translationX < -SWIPE_THRESHOLD ||
            (event.translationX < -SWIPE_MIN_DISTANCE &&
              event.velocityX < -SWIPE_VELOCITY);

          if (back) handleSwipe("right");
          else if (forward) handleSwipe("left");
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

  const holdGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(HOLD_TO_PAUSE_MS)
        .onStart(() => {
          cancelAnimation(storyTimer);
        })
        .onEnd(() => {
          runStoryTimer(storyTimer, onTimerDone);
        }),
    [storyTimer, onTimerDone],
  );

  const composedGesture = useMemo(
    () => Gesture.Exclusive(verticalPan, panGesture, holdGesture, tapGesture),
    [verticalPan, panGesture, holdGesture, tapGesture],
  );

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const safeGroupIndex = Math.max(0, Math.min(groupIndex, groups.length - 1));

  groupIndexRef.current = safeGroupIndex;
  storyIndexRef.current = storyIndex;
  groupsRef.current = groups;
  autoNextRef.current = handleAutoNext;

  useEffect(() => {
    if (!isVisible) {
      cancelAnimation(storyTimer);
      setReady(false);
      return;
    }
    if (!ready) return;
    scheduleOnUI(restartStoryTimer, storyTimer, onTimerDone);
  }, [isVisible, ready, safeGroupIndex, storyIndex, storyTimer, onTimerDone]);

  const activeGroup = groups[safeGroupIndex];

  if (!activeGroup?.stories.length) return null;

  const baseIndex = groupBaseIndex(groups, safeGroupIndex);
  const slides: {
    key: string;
    story: Story;
    index: number;
    isActive: boolean;
  }[] = [];
  const prevLast = groups[safeGroupIndex - 1]?.stories.at(-1);
  if (prevLast) {
    slides.push({
      key: `${groups[safeGroupIndex - 1].id}-${prevLast.id}`,
      story: prevLast,
      index: baseIndex - 1,
      isActive: false,
    });
  }
  activeGroup.stories.forEach((story, idx) => {
    slides.push({
      key: `${activeGroup.id}-${story.id}`,
      story,
      index: baseIndex + idx,
      isActive: idx === storyIndex,
    });
  });
  const nextFirst = groups[safeGroupIndex + 1]?.stories[0];
  if (nextFirst) {
    slides.push({
      key: `${groups[safeGroupIndex + 1].id}-${nextFirst.id}`,
      story: nextFirst,
      index: baseIndex + activeGroup.stories.length,
      isActive: false,
    });
  }

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
          style={[
            { flex: 1, backgroundColor: colors.background.surface },
            containerAnimatedStyle,
          ]}
        >
          <GestureDetector gesture={composedGesture}>
            <View className="flex-1">
              <View className="flex-1 overflow-hidden">
                {slides.map(({ key, story, index, isActive }) => (
                  <StorySlide
                    key={key}
                    index={index}
                    progress={progress}
                    width={width}
                    isActive={isActive}
                  >
                    {typeof story.customScreen === "function"
                      ? story.customScreen(() => handleSwipe("left"))
                      : story.customScreen}
                  </StorySlide>
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
                  className="flex-row px-screen gap-4 items-center"
                  style={{ paddingTop: top + 8 }}
                >
                  <View className="flex-1 flex-row gap-1">
                    {activeGroup.stories.map((_, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          if (idx === storyIndex) {
                            scheduleOnUI(
                              restartStoryTimer,
                              storyTimer,
                              onTimerDone,
                            );
                            return;
                          }
                          setStoryIndex(idx);
                          progress.value = withTiming(baseIndex + idx, {
                            duration: SLIDE_TRANSITION_MS,
                          });
                        }}
                        className="flex-1 active:opacity-70"
                      >
                        <View className="h-1.5 bg-neutral-0 rounded-full overflow-hidden">
                          {idx < storyIndex && (
                            <View className="h-full bg-primary-green-500" />
                          )}
                          {idx === storyIndex && (
                            <StoryProgressFill timer={storyTimer} />
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
