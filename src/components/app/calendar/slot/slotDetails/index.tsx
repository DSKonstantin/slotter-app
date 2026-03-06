import React, { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Button, StModal, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { mockSchedule } from "@/src/constants/mockSchedule";
import type { Schedule } from "@/src/store/redux/slices/calendarSlice";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Наличные",
  sbp: "СБП",
  online: "Онлайн-банк",
};

const STATUS_CONFIG = {
  pending: { label: "Ожидает", variant: "warning" as const },
  confirmed: { label: "Подтверждено", variant: "success" as const },
  cancelled: { label: "Отменено", variant: "info" as const },
};

const formatSlotTime = (timeStart: string, timeEnd: string) => {
  const parseUTC = (iso: string) => {
    const m = iso.match(/T(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "";
  };
  return `${parseUTC(timeStart)} - ${parseUTC(timeEnd)}`;
};

const calcDuration = (timeStart: string, timeEnd: string) => {
  const parse = (iso: string) => {
    const m = iso.match(/T(\d{2}):(\d{2})/);
    return m ? +m[1] * 60 + +m[2] : 0;
  };
  return parse(timeEnd) - parse(timeStart);
};

const formatRubles = (amount: number) => `${amount.toLocaleString("ru-RU")} ₽`;

type InfoRowProps = { label: string; value?: string };

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View className="flex-row justify-between py-4 border-b border-neutral-100">
    <Typography className="text-body text-neutral-500">{label}</Typography>
    <Typography
      weight="medium"
      className="text-body text-neutral-900 flex-1 text-right ml-4"
    >
      {value ?? "—"}
    </Typography>
  </View>
);

interface Props {
  slotId: string;
}

const SlotDetails: React.FC<Props> = ({ slotId }) => {
  const { bottom } = useSafeAreaInsets();
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  const slot: Schedule | undefined = mockSchedule.find((s) => s.id === slotId);

  const handleConfirm = useCallback(() => {
    Alert.alert("Подтвердить запись?", "", [
      { text: "Отмена", style: "cancel" },
      { text: "Подтвердить", onPress: () => {} },
    ]);
  }, []);

  const handleNoShow = useCallback(() => {
    Alert.alert("Клиент не явился?", "Запись будет помечена как не явился.", [
      { text: "Отмена", style: "cancel" },
      { text: "Отметить", style: "destructive", onPress: () => {} },
    ]);
  }, []);

  if (!slot || slot.status === "available") {
    return (
      <ScreenWithToolbar title="Детали слота">
        {({ topInset }) => (
          <View
            className="flex-1 items-center justify-center"
            style={{ marginTop: topInset }}
          >
            <Typography className="text-body text-neutral-400">
              Запись не найдена
            </Typography>
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  const statusConfig = STATUS_CONFIG[slot.status as keyof typeof STATUS_CONFIG];
  const duration = calcDuration(slot.timeStart, slot.timeEnd);
  const timeString = formatSlotTime(slot.timeStart, slot.timeEnd);

  return (
    <ScreenWithToolbar title="Детали слота">
      {({ topInset }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + bottom + 24,
          }}
          style={{ marginTop: topInset }}
        >
          {/* Client header */}
          <View className="flex-row items-center justify-between px-screen py-4 border-b border-neutral-100">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-neutral-200 items-center justify-center">
                <Typography
                  weight="semibold"
                  className="text-body text-neutral-600"
                >
                  {slot.clientName?.charAt(0) ?? "?"}
                </Typography>
              </View>
              <View>
                <Typography weight="semibold" className="text-body">
                  {slot.clientName}
                </Typography>
                {slot.clientPhone && (
                  <Typography className="text-caption text-neutral-500">
                    {slot.clientPhone}
                  </Typography>
                )}
              </View>
            </View>
            {statusConfig && (
              <Badge
                size="sm"
                title={statusConfig.label}
                variant={statusConfig.variant}
              />
            )}
          </View>

          {/* Info rows */}
          <View className="px-screen">
            <InfoRow label="Услуга" value={slot.services?.join(", ")} />
            <InfoRow label="Дата и время" value={timeString} />
            <InfoRow label="Длительность" value={`${duration} мин`} />
            {slot.price != null && (
              <InfoRow label="Стоимость" value={formatRubles(slot.price)} />
            )}
            {slot.paymentMethod && (
              <InfoRow
                label="Оплата"
                value={PAYMENT_LABELS[slot.paymentMethod]}
              />
            )}
            <InfoRow label="Комментарий к записи" value={slot.comment} />
          </View>

          {/* Action buttons */}
          <View className="px-screen mt-6 gap-3">
            {slot.status === "pending" && (
              <>
                <Button title="Подтвердить" onPress={handleConfirm} />
                <Button
                  title="Перенести"
                  variant="secondary"
                  onPress={() => setRescheduleVisible(true)}
                />
              </>
            )}

            {slot.status === "confirmed" && (
              <>
                <Button title="Клиент пришёл" onPress={() => {}} />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      title="Опоздал"
                      variant="secondary"
                      onPress={() => {}}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title="Не явился"
                      variant="secondary"
                      onPress={handleNoShow}
                    />
                  </View>
                </View>
                <Button
                  title="Перенести"
                  variant="secondary"
                  onPress={() => setRescheduleVisible(true)}
                />
              </>
            )}

            <Button
              title="Отменить запись"
              variant="secondary"
              onPress={() => setCancelVisible(true)}
            />
          </View>
        </ScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default SlotDetails;
