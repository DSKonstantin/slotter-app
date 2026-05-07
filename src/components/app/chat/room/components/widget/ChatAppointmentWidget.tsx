import React from "react";
import { Pressable, View } from "react-native";
import { Button, Typography } from "@/src/components/ui";
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
};

const ChatAppointmentWidget = ({
  appointment,
  payload,
  isOwnMessage,
  onLongPress,
}: Props) => {
  if (!appointment) {
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

  // Backend creates the proposal as `pending` (no `offered` state). Treat it
  // as awaiting the customer's acceptance until `customer_confirmed_at` is set
  // or the appointment moves to `confirmed`.
  const isAwaitingCustomer =
    appointment.status === "pending" && !appointment.customer_confirmed_at;

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
      <View className="px-4 pt-4 pb-2">
        <Typography className="text-caption text-neutral-500">
          Предлагаемое время
        </Typography>
      </View>

      <View style={{ height: 1, backgroundColor: colors.neutral[100] }} />

      <View className="px-4 py-3 gap-1">
        <View className="flex-row justify-between items-center">
          <Typography className="text-caption text-neutral-900">
            {[dateLabel, timeLabel].filter(Boolean).join(", ")}
            {duration ? ` · ${duration} мин` : ""}
          </Typography>
          {priceCents ? (
            <Typography
              weight="semibold"
              className="text-body text-neutral-900"
            >
              {formatRublesFromCents(priceCents)}
            </Typography>
          ) : null}
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: colors.neutral[100] }} />

      <View className="px-4 py-3 gap-2">
        {isAwaitingCustomer && !isOwnMessage ? (
          <>
            <Button title="Записаться" onPress={() => {}} />
            <View className="items-center">
              <Typography className="text-caption text-neutral-500">
                Предложить другое время
              </Typography>
            </View>
          </>
        ) : isAwaitingCustomer && isOwnMessage ? (
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
              {appointment.status === "confirmed"
                ? "Подтверждено"
                : appointment.status === "cancelled"
                  ? "Отменено"
                  : "Записано"}
            </Typography>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ChatAppointmentWidget;
