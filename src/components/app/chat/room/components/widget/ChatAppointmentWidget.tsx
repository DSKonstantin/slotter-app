import React from "react";
import { Pressable, View } from "react-native";
import { Button, Typography, Avatar, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { format, isToday, isTomorrow } from "date-fns";
import { ru } from "date-fns/locale";
import type {
  ChatMessageWidgetAppointment,
  ChatWidgetAppointmentPayload,
} from "@/src/store/redux/services/api-types";

type Props = {
  appointment: ChatMessageWidgetAppointment | null;
  payload: ChatWidgetAppointmentPayload;
  isOwnMessage: boolean;
  onLongPress?: () => void;
  masterName?: string;
  masterAvatar?: string;
  customerName?: string;
  customerAvatar?: string;
  serviceName?: string;
};

const ChatAppointmentWidget = ({
  appointment,
  payload,
  isOwnMessage,
  onLongPress,
  masterName = "Мастер",
  masterAvatar,
  customerName,
  customerAvatar,
  serviceName,
}: Props) => {
  if (!appointment) {
    return (
      <Pressable
        onLongPress={onLongPress}
        className="rounded-2xl overflow-hidden px-4 py-4 items-center"
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

  const startTime = payload.start_time ?? appointment.start_time;
  const duration = payload.duration ?? appointment.duration;
  const priceCents = payload.price_cents ?? appointment.price_cents;

  const dateObj = appointment.date ? new Date(appointment.date) : null;
  let dateLabel = "";
  if (dateObj) {
    if (isToday(dateObj)) dateLabel = "Сегодня";
    else if (isTomorrow(dateObj)) dateLabel = "Завтра";
    else dateLabel = format(dateObj, "d MMMM", { locale: ru });
  }

  const timeLabel = (() => {
    if (!startTime) return "";
    const d = new Date(startTime);
    if (!isNaN(d.getTime())) return format(d, "HH:mm");
    return startTime;
  })();

  const isAwaitingCustomer =
    appointment.status === "pending" && !appointment.customer_confirmed_at;

  return (
    <Pressable
      onLongPress={onLongPress}
      className="rounded-2xl"
      style={{
        width: 320,
        margin: 4,
        backgroundColor: colors.neutral[0],
        padding: 16,
      }}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Avatar
          name={customerName || masterName}
          uri={customerAvatar || masterAvatar}
          size="sm"
        />
        <Typography className="text-sm text-neutral-500">
          {masterName} предлагает время
        </Typography>
      </View>

      <View
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          backgroundColor: colors.neutral[100],
        }}
      >
        <View className="flex-row justify-between items-center gap-3">
          <View className="flex-1">
            <Typography
              weight="semibold"
              className="text-base text-neutral-900"
            >
              {[dateLabel, timeLabel].filter(Boolean).join(", ")}
              {duration ? ` · ${duration} мин` : ""}
            </Typography>
            {serviceName && (
              <Typography className="text-sm text-neutral-500 mt-1">
                {serviceName}
              </Typography>
            )}
          </View>
          {priceCents && (
            <Typography
              weight="semibold"
              className="text-base text-neutral-900"
            >
              {formatRublesFromCents(priceCents)}
            </Typography>
          )}
        </View>
      </View>
      {isAwaitingCustomer && !isOwnMessage ? (
        <>
          <Button title="Записаться" onPress={() => {}} />
          <Pressable className="items-center mt-3 py-2">
            <Typography className="text-sm text-neutral-500">
              Предложить другое время
            </Typography>
          </Pressable>
        </>
      ) : isAwaitingCustomer && isOwnMessage ? (
        <View className="items-center py-3">
          <Typography className="text-sm text-neutral-500">
            Ожидает подтверждения
          </Typography>
        </View>
      ) : appointment.status === "confirmed" ? (
        <View
          className="rounded-2xl flex-row items-center justify-center gap-2 py-3"
          style={{ backgroundColor: "#D4F5E6" }}
        >
          <Typography
            weight="semibold"
            className="text-base text-primary-green-700"
          >
            Записано
          </Typography>
          <StSvg name="Check_fill" size={24} color="#34C759" />
        </View>
      ) : (
        <View className="items-center py-3">
          <Typography weight="semibold" className="text-sm text-neutral-500">
            {appointment.status === "declined"
              ? "Отклонено"
              : appointment.status === "cancelled"
                ? "Отменено"
                : "Записано"}
          </Typography>
        </View>
      )}
    </Pressable>
  );
};

export default ChatAppointmentWidget;
