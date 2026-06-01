import React, { useCallback, useState } from "react";
import { Image, Platform, Pressable, UIManager, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { router } from "expo-router";
import dayjs from "dayjs";
import { Avatar, Typography } from "@/src/components/ui";
import { StSvg } from "@/src/components/ui/StSvg";
import { useAppSelector } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetCustomerUpcomingAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { formatTimeUntil, formatStartTime } from "@/src/utils/date/formatTime";

const arrowImage = require("@/assets/images/app/arrow.png");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const SPRING_CONFIG = { damping: 18, stiffness: 120, mass: 0.8 };

const STATUS_LABELS: Record<string, string> = {
  pending: "ожидает подтверждения",
  confirmed: "подтверждена",
  arrived: "клиент прибыл",
  completed: "завершена",
  cancelled: "отменена",
  declined: "отклонена",
  proposed: "предложена мастером",
};

const HomeHeader = () => {
  const { top } = useSafeAreaInsets();
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id;
  const [expanded, setExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const progress = useSharedValue(0);

  const { data } = useGetCustomerUpcomingAppointmentsQuery(userId!, {
    skip: !userId,
  });

  const mockAppointment = {
    id: 1,
    status: "confirmed" as const,
    start_time: "18:30:00",
    end_time: "19:30:00",
    date: dayjs().format("YYYY-MM-DD"),
    duration: 60,
    public_token: "mock",
    services: [
      {
        id: 1,
        name: "Массаж",
        duration: 60,
        price_cents: 0,
        price_currency: "RUB",
      },
    ],
    additional_services: [],
    user: {
      id: 1,
      first_name: "Алексей",
      last_name: null,
      address: "ул. Пушкинская, 22",
      avatar_url: null,
      avatar_blurhash: null,
      phone: null,
    },
  };

  const appointment = data?.appointments?.[0] ?? null;
  const expandAppointment = appointment ?? mockAppointment;

  const today = dayjs().locale("ru");
  const dateLabel =
    today.format("dd").charAt(0).toUpperCase() +
    today.format("dd").slice(1) +
    " · " +
    today.format("DD.MM");

  const expandTo = useCallback((next: boolean) => {
    progress.value = withSpring(next ? 1 : 0, SPRING_CONFIG);
    setExpanded(next);
  }, []);

  const toggle = useCallback(() => {
    expandTo(!expanded);
  }, [expanded]);

  const hasMoved = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      hasMoved.value = false;
    })
    .onChange((e) => {
      if (expandedHeight === 0) return;
      if (Math.abs(e.translationY) > 5) hasMoved.value = true;
      if (hasMoved.value) {
        progress.value = Math.max(
          0,
          Math.min(1, progress.value + e.changeY / expandedHeight),
        );
      }
    })
    .onEnd((e) => {
      if (!hasMoved.value) {
        runOnJS(toggle)();
        return;
      }
      const shouldExpand = progress.value > 0.4 || e.velocityY > 300;
      progress.value = withSpring(shouldExpand ? 1 : 0, SPRING_CONFIG);
      runOnJS(setExpanded)(shouldExpand);
    });

  const expandedStyle = useAnimatedStyle(() => ({
    height:
      expandedHeight > 0
        ? interpolate(progress.value, [0, 1], [0, expandedHeight])
        : undefined,
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.6, 1]),
    overflow: "hidden",
  }));

  const dashStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.5, 1], [0, 1]),
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5], [1, 0]),
  }));

  return (
    <View className="mb-3 rounded-b-[40px] bg-background-surface overflow-hidden">
      <View className="px-4 gap-4" style={{ paddingTop: top + 16 }}>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push(Routers.app.account.root)}
            className="active:opacity-70"
          >
            <Avatar
              uri={user?.avatar_url ?? undefined}
              blurhash={user?.avatar_blurhash}
              name={user?.name ?? ""}
              size="md"
            />
          </Pressable>
          <Pressable
            onPress={() => router.push(Routers.app.account.root)}
            className="ml-3 flex-1 active:opacity-70"
          >
            <Typography
              weight="semibold"
              className="text-body"
              numberOfLines={1}
            >
              {user?.name ?? ""}
            </Typography>
          </Pressable>
          <View className="flex-row gap-2">
            <Pressable
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center active:opacity-70"
            >
              <StSvg name="Time_fill" size={20} color={colors.neutral[700]} />
            </Pressable>
            <Pressable
              onPress={() => router.push(Routers.app.account.notifications)}
              className="w-10 h-10 rounded-full bg-neutral-100 items-center justify-center active:opacity-70"
            >
              <StSvg name="Bell_fill" size={20} color={colors.neutral[700]} />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-[4px] bg-primary-green-500" />
          <Typography className="text-caption text-neutral-500">
            {dateLabel}
          </Typography>
        </View>

        {appointment ? (
          <Typography className="text-body text-neutral-700">
            <Typography className="text-body text-neutral-500">
              Визит{" "}
            </Typography>
            <StSvg
              name="File_dock_fill"
              size={14}
              color={colors.neutral[500]}
            />
            {"  "}
            <Typography weight="medium" className="text-body">
              {appointment.services[0]?.name ?? ""} {appointment.duration} мин
            </Typography>
            <Typography className="text-body text-neutral-500">
              {" · "}начало в{" "}
            </Typography>
            <Typography weight="semibold" className="text-body">
              {formatStartTime(appointment.start_time)}
            </Typography>
            <Typography className="text-body text-neutral-500">
              {" · "}мастер{" "}
            </Typography>
            <Typography weight="semibold" className="text-body">
              {appointment.user.first_name}
            </Typography>
            <Typography className="text-body text-neutral-500">
              {" · "}услуга{" "}
            </Typography>
            <StSvg name="Check_fill" size={14} color={colors.neutral[700]} />
            {"  "}
            <Typography className="text-body text-neutral-700">
              {STATUS_LABELS[appointment.status] ?? appointment.status}
            </Typography>
          </Typography>
        ) : (
          <Typography className="text-body text-neutral-400 leading-relaxed">
            Для добавления мастера, перейди по{" "}
            <Typography
              weight="semibold"
              className="text-body text-neutral-900"
            >
              ссылке
            </Typography>{" "}
            <StSvg name="link_alt" size={15} color={colors.neutral[900]} />
            {"  "}или отсканируй{" "}
            <StSvg name="Export_fill" size={15} color={colors.neutral[900]} />{" "}
            <Typography
              weight="semibold"
              className="text-body text-neutral-900"
            >
              QR-код
            </Typography>
          </Typography>
        )}

        <Animated.View style={expandedStyle}>
          <View
            className="gap-4"
            style={
              expandedHeight === 0
                ? { position: "absolute", opacity: 0 }
                : undefined
            }
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && expandedHeight === 0) setExpandedHeight(h);
            }}
          >
            <View className="flex-row gap-3">
              {!!expandAppointment.user.address && (
                <View className="flex-1 bg-neutral-100 rounded-xl p-3 gap-1">
                  <View className="flex-row items-center gap-1">
                    <StSvg
                      name="Pin_fill"
                      size={14}
                      color={colors.neutral[500]}
                    />
                    <Typography className="text-caption text-neutral-500">
                      Адрес:
                    </Typography>
                  </View>
                  <Typography
                    weight="medium"
                    className="text-caption"
                    numberOfLines={2}
                  >
                    {expandAppointment.user.address}
                  </Typography>
                </View>
              )}
              <View className="flex-1 bg-neutral-100 rounded-xl p-3 gap-1">
                <View className="flex-row items-center gap-1">
                  <StSvg
                    name="Time_fill"
                    size={14}
                    color={colors.neutral[500]}
                  />
                  <Typography className="text-caption text-neutral-500">
                    До начала:
                  </Typography>
                </View>
                <Typography weight="semibold" className="text-caption">
                  {formatTimeUntil(
                    expandAppointment.date,
                    expandAppointment.start_time,
                  )}
                </Typography>
              </View>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() =>
                  router.push(Routers.app.history.slot(expandAppointment.id))
                }
                className="flex-1 bg-neutral-900 rounded-full py-2.5 items-center active:opacity-70"
              >
                <Typography
                  weight="semibold"
                  className="text-caption text-white"
                >
                  Детали
                </Typography>
              </Pressable>
              <Pressable className="flex-1 bg-neutral-100 rounded-full py-2.5 items-center active:opacity-70">
                <Typography weight="semibold" className="text-caption">
                  Перенести
                </Typography>
              </Pressable>
              <Pressable className="flex-1 bg-neutral-100 rounded-full py-2.5 items-center active:opacity-70">
                <Typography weight="semibold" className="text-caption">
                  Связаться
                </Typography>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Pressable className="items-center py-3">
          <Animated.View style={[{ position: "absolute" }, arrowStyle]}>
            <Image
              source={arrowImage}
              style={{ width: 32, height: 12 }}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={dashStyle}>
            <View className="w-8 h-1 rounded-full bg-neutral-100" />
          </Animated.View>
        </Pressable>
      </GestureDetector>
    </View>
  );
};

export default HomeHeader;
