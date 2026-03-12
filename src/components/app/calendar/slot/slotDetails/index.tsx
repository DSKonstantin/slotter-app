import React, { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  ScrollView,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

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
import {
  useGetAppointmentQuery,
  useUpdateAppointmentMutation,
} from "@/src/store/redux/services/api/appointmentsApi";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import CancelModal from "@/src/components/app/calendar/slot/cancelModal";
import RescheduleModal from "@/src/components/app/calendar/slot/rescheduleModal";
import SlotActions from "@/src/components/app/calendar/slot/slotActions";
import { formatTimeString } from "@/src/utils/date/formatTime";
import {
  formatRublesFromCents,
  centsToRubles,
  rublesToCents,
} from "@/src/utils/price/formatPrice";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

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
  const [editingDuration, setEditingDuration] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: slot,
    isLoading,
    refetch,
  } = useGetAppointmentQuery(Number(slotId));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const methods = useForm({
    defaultValues: {
      comment: slot?.comment ?? "",
      duration: String(slot?.duration ?? ""),
      price: slot ? String(centsToRubles(slot.price_cents)) : "",
    },
  });

  const id = Number(slotId);

  const handleSaveDuration = async () => {
    const value = Number(methods.getValues("duration"));
    if (!value || value <= 0) return;
    try {
      await updateAppointment({ id, body: { duration: value } }).unwrap();
      toast.success("Длительность обновлена");
      setEditingDuration(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Не удалось обновить длительность"),
      );
    }
  };

  const handleSavePrice = async () => {
    const value = Number(methods.getValues("price"));
    if (value < 0) return;
    try {
      await updateAppointment({
        id,
        body: { price_cents: rublesToCents(value) },
      }).unwrap();
      toast.success("Стоимость обновлена");
      setEditingPrice(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось обновить стоимость"));
    }
  };

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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
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

            <View className="mx-screen gap-2 mt-5 bg-background-surface rounded-base p-5">
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
                          appointmentId: String(slot.id),
                          selectedServiceIds: slot.services
                            .map((s) => s.id)
                            .join(","),
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
                  {editingDuration ? (
                    <View className="flex-1">
                      <RhfTextField
                        name="duration"
                        placeholder="мин"
                        keyboardType="numeric"
                        hideErrorText
                        autoFocus
                        size="xs"
                      />
                    </View>
                  ) : (
                    <Typography
                      weight="regular"
                      className="text-body text-neutral-900 flex-shrink text-right"
                    >
                      {slot.duration} мин
                    </Typography>
                  )}
                  <IconButton
                    size="xs"
                    loading={editingDuration && isUpdating}
                    onPress={
                      editingDuration
                        ? handleSaveDuration
                        : () => {
                            methods.setValue("duration", String(slot.duration));
                            setEditingDuration(true);
                          }
                    }
                    icon={
                      <StSvg
                        name={
                          editingDuration ? "Check_round_fill" : "Edit_light"
                        }
                        size={20}
                        color={
                          editingDuration
                            ? colors.primary.blue[500]
                            : colors.neutral[500]
                        }
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
                  {editingPrice ? (
                    <View className="flex-1">
                      <RhfTextField
                        name="price"
                        placeholder="₽"
                        keyboardType="numeric"
                        hideErrorText
                        autoFocus
                        size="xs"
                      />
                    </View>
                  ) : (
                    <Typography
                      weight="regular"
                      className="text-body text-neutral-900 flex-shrink text-right"
                    >
                      {formatRublesFromCents(slot.price_cents)}
                    </Typography>
                  )}
                  <IconButton
                    size="xs"
                    loading={editingPrice && isUpdating}
                    onPress={
                      editingPrice
                        ? handleSavePrice
                        : () => {
                            methods.setValue(
                              "price",
                              String(centsToRubles(slot.price_cents)),
                            );
                            setEditingPrice(true);
                          }
                    }
                    icon={
                      <StSvg
                        name={editingPrice ? "Check_round_fill" : "Edit_light"}
                        size={20}
                        color={
                          editingPrice
                            ? colors.primary.blue[500]
                            : colors.neutral[500]
                        }
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
