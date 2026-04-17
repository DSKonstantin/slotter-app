import React from "react";
import { Pressable, View } from "react-native";
import { Avatar, Button, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { format, isToday, isTomorrow } from "date-fns";
import { ru } from "date-fns/locale";
import type { ChatMessageWidgetAppointment } from "@/src/store/redux/services/api-types";

type Props = {
  appointment: ChatMessageWidgetAppointment;
  isOwnMessage: boolean;
  onLongPress?: () => void;
};

const ChatAppointmentWidget = ({
  appointment,
  isOwnMessage,
  onLongPress,
}: Props) => {
  const userName = appointment.user
    ? [appointment.user.first_name, appointment.user.last_name]
        .filter(Boolean)
        .join(" ")
    : "";

  const dateObj = appointment.date ? new Date(appointment.date) : null;
  let dateLabel = "";
  if (dateObj) {
    if (isToday(dateObj)) dateLabel = "Сегодня";
    else if (isTomorrow(dateObj)) dateLabel = "Завтра";
    else dateLabel = format(dateObj, "d MMMM", { locale: ru });
  }

  const timeLabel = (() => {
    if (!appointment.start_time) return "";
    const d = new Date(appointment.start_time);
    if (!isNaN(d.getTime())) return format(d, "HH:mm");
    // fallback: plain time string like "10:00"
    return appointment.start_time;
  })();
  const serviceNames =
    appointment.services?.map((s) => s.name).join(", ") ?? "";

  const isOffered = appointment.status === "offered";
  const isEmpty =
    !appointment.date &&
    !appointment.start_time &&
    !appointment.services?.length;

  if (isEmpty) {
    return (
      <Pressable
        onLongPress={onLongPress}
        className="rounded-xl overflow-hidden px-4 py-4 items-center"
        style={{
          backgroundColor: colors.neutral[0],
          borderWidth: 1,
          borderColor: colors.neutral[100],
          width: 280,
          margin: 4,
        }}
      >
        <Typography className="text-caption text-neutral-400">
          Запись больше недоступна
        </Typography>
      </Pressable>
    );
  }

  return (
    <Pressable
      onLongPress={onLongPress}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: colors.neutral[0],
        borderWidth: 1,
        borderColor: colors.neutral[100],
        width: 280,
        margin: 4,
      }}
    >
      {/* Header: avatar + name */}
      <View className="px-4 pt-4 pb-3 flex-row items-center gap-2">
        <Avatar
          name={userName}
          uri={appointment.user?.avatar_url ?? undefined}
          size="xs"
        />
        <Typography className="text-caption text-neutral-500 flex-1">
          {userName} предлагает время
        </Typography>
      </View>

      <View style={{ height: 1, backgroundColor: colors.neutral[100] }} />

      {/* Date, time, duration, price, service */}
      <View className="px-4 py-3 gap-1">
        <View className="flex-row justify-between items-center">
          <Typography className="text-caption text-neutral-900">
            {dateLabel}, {timeLabel} · {appointment.duration} мин
          </Typography>
          <Typography weight="semibold" className="text-body text-neutral-900">
            {formatRublesFromCents(appointment.price_cents)}
          </Typography>
        </View>

        {serviceNames ? (
          <Typography
            className="text-caption text-neutral-500"
            numberOfLines={1}
          >
            {serviceNames}
          </Typography>
        ) : null}
      </View>

      <View style={{ height: 1, backgroundColor: colors.neutral[100] }} />

      {/* Action */}
      <View className="px-4 py-3 gap-2">
        {isOffered && !isOwnMessage ? (
          <>
            <Button title="Записаться" onPress={() => {}} />
            <View className="items-center">
              <Typography className="text-caption text-neutral-500">
                Предложить другое время
              </Typography>
            </View>
          </>
        ) : isOffered && isOwnMessage ? (
          <View className="items-center">
            <Typography className="text-caption text-neutral-500">
              Ожидает подтверждения
            </Typography>
          </View>
        ) : (
          <View className="items-center">
            <Typography
              weight="semibold"
              className="text-caption text-neutral-500"
            >
              {appointment.status === "pending"
                ? "Записано"
                : appointment.status}
            </Typography>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ChatAppointmentWidget;
