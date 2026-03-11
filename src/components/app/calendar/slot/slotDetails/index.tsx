import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { ScrollView, View, ActivityIndicator } from "react-native";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useGetAppointmentQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import CancelModal from "@/src/components/app/calendar/slot/cancelModal";
import RescheduleModal from "@/src/components/app/calendar/slot/rescheduleModal";
import SlotActions from "@/src/components/app/calendar/slot/slotActions";
import { formatTimeString } from "@/src/utils/date/formatTime";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Наличные",
  sbp: "СБП",
  online_bank: "Онлайн-банк",
};

const STATUS_CONFIG = {
  pending: { label: "Ожидает", variant: "warning" as const },
  confirmed: { label: "Подтверждено", variant: "success" as const },
  arrived: { label: "Пришёл", variant: "success" as const },
  late: { label: "Опоздал", variant: "warning" as const },
  completed: { label: "Завершено", variant: "success" as const },
  no_show: { label: "Не явился", variant: "info" as const },
  cancelled: { label: "Отменено", variant: "info" as const },
};

interface Props {
  slotId: string;
}

const SlotDetails: React.FC<Props> = ({ slotId }) => {
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  const { data: slot, isLoading } = useGetAppointmentQuery(Number(slotId));
  const methods = useForm();

  const id = Number(slotId);

  if (isLoading) {
    return (
      <ScreenWithToolbar title="Детали слота">
        {({ topInset }) => (
          <View
            className="flex-1 items-center justify-center"
            style={{ marginTop: topInset }}
          >
            <ActivityIndicator color={colors.neutral[400]} />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (!slot) {
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

  const statusConfig = STATUS_CONFIG[slot.status] ?? null;
  const timeString = `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`;
  const serviceNames = slot.services.map((s) => s.name).join(", ");
  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Детали слота">
        {({ topInset, bottomInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: bottomInset + 16,
            }}
            style={{ marginTop: topInset }}
          >
            <View className="px-screen">
              <Card
                title={slot.customer.name ?? "—"}
                subtitle={slot.customer.phone ?? undefined}
                left={
                  <Avatar name={slot.customer.name ?? undefined} size="sm" />
                }
                right={
                  <StSvg
                    name="Expand_right_light"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>

            <View className="mx-screen gap-2 mt-5 bg-background-surface rounded-base p-4">
              {statusConfig && (
                <>
                  <View className="flex-row items-center justify-between">
                    <Typography className="text-body text-neutral-500">
                      Статус
                    </Typography>
                    <Badge
                      title={statusConfig.label}
                      variant={statusConfig.variant}
                      size="sm"
                    />
                  </View>
                  <Divider className="my-2" />
                </>
              )}

              <View className="flex-row items-start justify-between gap-2">
                <Typography className="text-body text-neutral-500">
                  Услуга
                </Typography>
                <View className="flex-row items-center gap-1 flex-1 justify-end">
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-900 flex-shrink text-right"
                  >
                    {serviceNames || "—"}
                  </Typography>
                  <IconButton
                    size="xs"
                    onPress={() =>
                      router.push(
                        Routers.app.calendar.slotSelectService({
                          date: slot.date,
                          time: slot.start_time,
                        }),
                      )
                    }
                    icon={
                      <StSvg
                        name="Edit_light"
                        size={20}
                        color={colors.neutral[500]}
                      />
                    }
                  />
                </View>
              </View>

              <Divider className="my-2" />

              <View className="flex-row items-start justify-between gap-2">
                <Typography className="text-body text-neutral-500">
                  Дата и время
                </Typography>
                <Typography
                  weight="regular"
                  className="text-body text-neutral-900 flex-shrink text-right"
                >
                  {timeString}
                </Typography>
              </View>

              <Divider className="my-2" />

              <View className="flex-row items-start justify-between gap-2">
                <Typography className="text-body text-neutral-500">
                  Длительность
                </Typography>
                <View className="flex-row items-center gap-1 flex-1 justify-end">
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-900 flex-shrink text-right"
                  >
                    {slot.duration} мин
                  </Typography>
                  <IconButton
                    size="xs"
                    icon={
                      <StSvg
                        name="Edit_light"
                        size={20}
                        color={colors.neutral[500]}
                      />
                    }
                  />
                </View>
              </View>

              <Divider className="my-2" />
              <View className="flex-row items-start justify-between gap-2">
                <Typography className="text-body text-neutral-500">
                  Стоимость
                </Typography>
                <View className="flex-row items-center gap-1 flex-1 justify-end">
                  <Typography
                    weight="regular"
                    className="text-body text-neutral-900 flex-shrink text-right"
                  >
                    {formatRublesFromCents(slot.price_cents)}
                  </Typography>
                  <IconButton
                    size="xs"
                    icon={
                      <StSvg
                        name="Edit_light"
                        size={20}
                        color={colors.neutral[500]}
                      />
                    }
                  />
                </View>
              </View>
            </View>

            <View className="px-screen mt-5">
              <RhfTextField
                name="сomment"
                label="Комментарий к записи"
                placeholder="Комментарий к записи"
                multiline={true}
              />
            </View>

            <SlotActions
              appointmentId={id}
              status={slot.status}
              onReschedule={() => setRescheduleVisible(true)}
              onCancel={() => setCancelVisible(true)}
            />
          </ScrollView>
        )}
      </ScreenWithToolbar>

      <CancelModal
        visible={cancelVisible}
        appointmentId={id}
        onClose={() => setCancelVisible(false)}
      />
      <RescheduleModal
        visible={rescheduleVisible}
        appointmentId={id}
        defaultDate={slot.date}
        onClose={() => setRescheduleVisible(false)}
      />
    </FormProvider>
  );
};

export default SlotDetails;
