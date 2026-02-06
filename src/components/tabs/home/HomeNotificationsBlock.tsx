import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, View } from "react-native";

import { colors } from "@/src/styles/colors";
import SpecialistHomeNotifications from "@/src/components/shared/cards/specialistHomeNotifications";
import { PaginationDots } from "@/src/components/ui";

const SWIPE_THRESHOLD = 40;

const NOTIFICATIONS = [
  {
    iconName: "Time_fill",
    iconColor: colors.accent.indigo[500],
    title: "2 неподтвержденные записи",
    label: "Посмотреть",
  },
  {
    iconName: "Alarm_fill",
    iconColor: colors.accent.red[500],
    title: "Продолжим перенос базы клиентов? продолжим перенос базы клиентов?",
    label: "Открыть",
  },
  {
    iconName: "Wallet_fill",
    iconColor: colors.accent.indigo[500],
    title: "Новый платеж",
    label: "Детали",
  },
];

const useFadeOnChange = (deps: any[]) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 60,
      useNativeDriver: true,
    }).start();
  }, deps);

  return opacity;
};

const HomeNotificationsBlock = () => {
  const [index, setIndex] = useState(0);
  const opacity = useFadeOnChange([index]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,

        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            setIndex((prev) =>
              prev === 0 ? NOTIFICATIONS.length - 1 : prev - 1,
            );
          }

          if (gesture.dx < -SWIPE_THRESHOLD) {
            setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
          }
        },
      }),
    [],
  );

  return (
    <View {...panResponder.panHandlers}>
      <View className="bg-background-card rounded-base overflow-hidden">
        <Animated.View style={{ opacity }}>
          <SpecialistHomeNotifications data={NOTIFICATIONS[index]} />
        </Animated.View>
      </View>

      <View className="flex-1 justify-center items-center mt-2.5">
        <PaginationDots
          count={NOTIFICATIONS.length}
          activeIndex={index}
          onSelect={(nextIndex) => {
            console.log("go to", nextIndex);
            setIndex(nextIndex);
          }}
        />
      </View>
    </View>
  );
};

export default HomeNotificationsBlock;
