import React from "react";
import { Pressable, View } from "react-native";
import { Button, Typography, Avatar, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
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
  onAccept?: () => void;
};

const ChatAppointmentWidget = ({
  appointment,
  payload,
  isOwnMessage,
  onLongPress,
  masterName = "Мастер",
  masterAvatar,
  serviceName,
  onAccept,
}: Props) => {
  if (!appointment) {
    return (
      <Pressable
        onLongPress={onLongPress}
        className="rounded-2xl overflow-hidden px-4 py-4 items-center"
        style={{
          backgroundColor: colors.neutral[0],
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

  // parseISO("2026-05-27") → local midnight, isToday/isTomorrow работают корректно.
  // new Date("2026-05-27") парсирует как UTC midnight → неверно в западных таймзонах.
  const dateObj = appointment.date ? parseISO(appointment.date) : null;
  let dateLabel = "";
  if (dateObj) {
    if (isToday(dateObj)) dateLabel = "Сегодня";
    else if (isTomorrow(dateObj)) dateLabel = "Завтра";
    else dateLabel = format(dateObj, "d MMMM", { locale: ru });
  }

  // start_time из blueprint — ISO-строка с dummy-датой ("2000-01-01T14:00:00.000Z").
  // formatTimeFromISO вытаскивает HH:MM из T-части без конвертации timezone.
  const timeLabel = startTime ? formatTimeFromISO(startTime) : "";

  const isAwaitingCustomer = appointment.status === "proposed";

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
        <Avatar name={masterName} uri={masterAvatar} size="sm" />
        <Typography className="text-sm text-neutral-500">
          {masterName} предлагает время
        </Typography>
      </View>

      <View
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          backgroundColor: colors.background.DEFAULT,
        }}
      >
        <View className="flex-row justify-between items-center gap-3">
          <View className="flex-1">
            <Typography
              weight="semibold"
              className="text-body text-neutral-900"
            >
              {[dateLabel, timeLabel].filter(Boolean).join(", ")}
              {duration ? ` · ${duration} мин` : ""}
            </Typography>
            {serviceName && (
              <Typography className="text-caption text-neutral-500">
                {serviceName}
              </Typography>
            )}
            {!!appointment.additional_services?.length && (
              <Typography className="text-caption text-neutral-400">
                {"+ "}
                {appointment.additional_services.map((s) => s.name).join(", ")}
              </Typography>
            )}
          </View>
          {!!priceCents && (
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
        <Button title="Записаться" onPress={() => onAccept?.()} />
      ) : isAwaitingCustomer && isOwnMessage ? (
        <View className="items-center justify-center py-3 h-[50px]">
          <Typography className="text-caption text-neutral-500">
            Ожидает подтверждения
          </Typography>
        </View>
      ) : appointment.status === "declined" ||
        appointment.status === "cancelled" ? (
        <View className="items-center justify-center py-3 h-[50px]">
          <Typography
            weight="semibold"
            className="text-body text-accent-red-500"
          >
            Отменено
          </Typography>
          <StSvg
            name="Close_round_fill"
            size={20}
            color={colors.accent.red[500]}
          />
        </View>
      ) : (
        <View
          className="rounded-2xl flex-row items-center justify-center gap-2 py-3 h-[50px]"
          style={{ backgroundColor: "#D4F5E6" }}
        >
          <Typography
            weight="semibold"
            className="text-body text-primary-green-700"
          >
            Записано
          </Typography>
          <StSvg name="Check_fill" size={24} color="#34C759" />
        </View>
      )}
    </Pressable>
  );
};

export default ChatAppointmentWidget;
