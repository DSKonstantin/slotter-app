import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

// Индексы трека сквозные по всем группам (глобальные): граница групп — такой
// же соседний индекс, поэтому переход между группами анимируется той же
// механикой, что и внутри группы.
const groupBaseIndex = (groups: StoryGroup[], groupIdx: number) =>
  groups.slice(0, groupIdx).reduce((acc, g) => acc + g.stories.length, 0);

// Слайд позиционируется горизонтальным треком: смещение от разницы между
// своим глобальным индексом и анимируемым progress — активный стоит в нуле,
// следующий ждёт справа за экраном, предыдущий — слева.
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

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  // анимируемая позиция слайда внутри активной группы (едет к storyIndex)
  const progress = useSharedValue(0);
  const groupIndexRef = useRef(groupIndex);
  const storyIndexRef = useRef(storyIndex);
  const groupsRef = useRef(groups);

  const { top } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const handleAnimateIn = useCallback(() => {
    const found = groups.findIndex((g) => g.id === initialGroupId);
    const idx = found >= 0 ? found : 0;
    setGroupIndex(idx);
    setStoryIndex(0);
    progress.value = groupBaseIndex(groups, idx);
    opacity.value = 0;
    translateY.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [groups, initialGroupId, progress, opacity, translateY]);

  const handleClose = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  }, [opacity, onClose]);

  // "left" — вперёд, "right" — назад. На границе группы переходим к
  // соседней группе; вперёд с последнего слайда последней группы — закрытие.
  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const allGroups = groupsRef.current;
      const groupIdx = groupIndexRef.current;
      const storyIdx = storyIndexRef.current;
      const storiesLen = allGroups[groupIdx]?.stories.length ?? 0;
      const base = groupBaseIndex(allGroups, groupIdx);

      const slideTo = (globalIdx: number) => {
        progress.value = withTiming(globalIdx, {
          duration: SLIDE_TRANSITION_MS,
        });
      };

      if (direction === "left") {
        if (storyIdx < storiesLen - 1) {
          setStoryIndex(storyIdx + 1);
          slideTo(base + storyIdx + 1);
        } else if (groupIdx < allGroups.length - 1) {
          setGroupIndex(groupIdx + 1);
          setStoryIndex(0);
          slideTo(base + storiesLen);
        } else {
          handleClose();
        }
      } else {
        if (storyIdx > 0) {
          setStoryIndex(storyIdx - 1);
          slideTo(base + storyIdx - 1);
        } else if (groupIdx > 0) {
          // назад через границу группы — на последний слайд предыдущей,
          // как перелистывание назад
          const lastIdx = (allGroups[groupIdx - 1]?.stories.length ?? 1) - 1;
          setGroupIndex(groupIdx - 1);
          setStoryIndex(lastIdx);
          slideTo(base - 1);
        }
      }
    },
    [handleClose, progress],
  );

  const verticalPan = useMemo(
    () =>
      Gesture.Pan()
        // активируемся только на движение вниз; увод вверх или вбок — фейл,
        // чтобы не перехватывать горизонтальные свайпы и тапы (Exclusive
        // держит их, пока этот жест не зафейлится).
        // Колбэки — ворклеты: жест и анимация живут в UI-потоке, без прыжков
        // через мост (иначе при занятом JS-потоке кадры теряются и модалка
        // дёргается)
        .activeOffsetY(15)
        .failOffsetY(-15)
        .failOffsetX([-10, 10])
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
            // translateY не сбрасываем здесь: Modal скрывается асинхронно в
            // JS-потоке, и сброс вернул бы модалку на экран на кадр-другой
            // (блик). Значения обнуляет handleAnimateIn при следующем открытии.
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
          }
        }),
    [translateY, opacity, height, onClose],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        // допускаем вертикальный дрейф пальца при горизонтальном свайпе
        .failOffsetY([-30, 30])
        .runOnJS(true)
        .onEnd((event) => {
          // длинный медленный свайп — по дистанции, короткий флик — по скорости
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

  const composedGesture = useMemo(
    () => Gesture.Exclusive(verticalPan, panGesture, tapGesture),
    [verticalPan, panGesture, tapGesture],
  );

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  groupIndexRef.current = groupIndex;
  storyIndexRef.current = storyIndex;
  groupsRef.current = groups;

  const activeGroup = groups[groupIndex];

  if (!activeGroup?.stories.length) return null;

  // Кроме слайдов активной группы держим смонтированными слайды, на которые
  // ведут переходы между группами: последний слайд предыдущей группы и
  // первый — следующей. Они стоят на своих глобальных позициях трека (за
  // экраном) и при переходе через границу въезжают той же анимацией, что и
  // слайды внутри группы. Ключи стабильны между рендерами, поэтому при смене
  // группы уже смонтированный (и задекодированный expo-image) слайд
  // переиспользуется — без белого моргания.
  const baseIndex = groupBaseIndex(groups, groupIndex);
  const slides: {
    key: string;
    story: Story;
    index: number;
    isActive: boolean;
  }[] = [];
  const prevLast = groups[groupIndex - 1]?.stories.at(-1);
  if (prevLast) {
    slides.push({
      key: `${groups[groupIndex - 1].id}-${prevLast.id}`,
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
  const nextFirst = groups[groupIndex + 1]?.stories[0];
  if (nextFirst) {
    slides.push({
      key: `${groups[groupIndex + 1].id}-${nextFirst.id}`,
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
                  className="px-screen gap-4 items-end"
                  style={{ paddingTop: top + 8 }}
                >
                  <View className="flex-1 flex-row gap-1">
                    {activeGroup.stories.map((_, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          setStoryIndex(idx);
                          progress.value = withTiming(baseIndex + idx, {
                            duration: SLIDE_TRANSITION_MS,
                          });
                        }}
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
