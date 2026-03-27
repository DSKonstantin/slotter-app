import React, { useState, useCallback, useEffect } from "react";
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

import { EDITABLE_STATUSES, STATUS_CONFIG } from "./constants";
import InfoRow from "./InfoRow";
import EditableRow from "./EditableRow";

type EditingField = "duration" | "price" | null;

interface Props {
  slotId: string;
}

const SlotDetails: React.FC<Props> = ({ slotId }) => {
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: slot,
    isLoading,
    refetch,
  } = useGetAppointmentQuery(Number(slotId));

  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const methods = useForm({
    defaultValues: { comment: "", duration: "", price: "" },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const id = Number(slotId);

  const handleSave = async () => {
    if (!slot || !editingField) return;

    const duration = Number(methods.getValues("duration"));
    const price = Number(methods.getValues("price"));

    if (editingField === "duration") {
      if (!duration || duration <= 0) return;
      if (duration === slot.duration) {
        setEditingField(null);
        return;
      }
    }

    if (editingField === "price") {
      if (price < 0) return;
      if (rublesToCents(price) === slot.price_cents) {
        setEditingField(null);
        return;
      }
    }

    try {
      await updateAppointment({
        id,
        body:
          editingField === "duration"
            ? { duration }
            : { price_cents: rublesToCents(price) },
      }).unwrap();
      toast.success("Сохранено");
      setEditingField(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить"));
    }
  };

  useEffect(() => {
    if (!slot) return;
    methods.reset({
      comment: slot.comment ?? "",
      duration: String(slot.duration),
      price: String(centsToRubles(slot.price_cents)),
    });
  }, [methods, slot]);

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Детали слота">
        {({ topInset, bottomInset }) => {
          if (isLoading) {
            return (
              <View
                className="flex-1 items-center justify-center"
                style={{ marginTop: topInset }}
              >
                <ActivityIndicator color={colors.neutral[400]} />
              </View>
            );
          }

          if (!slot) {
            return (
              <View
                className="flex-1 items-center justify-center"
                style={{ marginTop: topInset }}
              >
                <Typography className="text-body text-neutral-400">
                  Запись не найдена
                </Typography>
              </View>
            );
          }

          const canEdit = (EDITABLE_STATUSES as readonly string[]).includes(
            slot.status,
          );
          const statusConfig = STATUS_CONFIG[slot.status] ?? null;
          const timeString = `${formatTimeString(slot.start_time)} - ${formatTimeString(slot.end_time)}`;
          const serviceNames = slot.services.map((s) => s.name).join(", ");
          const additionalServiceNames = slot.additional_services
            .map((s) => s.name)
            .join(", ");
          const serviceSelectionParams = {
            date: slot.date,
            time: slot.start_time,
            appointmentId: String(slot.id),
            selectedServiceIds: slot.services.map((s) => s.id).join(","),
            selectedAdditionalServiceIds: slot.additional_services
              .map((s) => s.id)
              .join(","),
          };

          return (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
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
                      <Avatar
                        name={slot.customer.name ?? undefined}
                        size="sm"
                      />
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
                    <InfoRow
                      label="Статус"
                      right={
                        <Badge
                          size="sm"
                          title={statusConfig.label}
                          variant={statusConfig.variant}
                          icon={statusConfig.icon}
                        />
                      }
                    />
                  )}

                  <InfoRow
                    label="Услуга"
                    right={
                      <View className="flex-row items-center gap-1 flex-1 justify-end">
                        <Typography
                          weight="regular"
                          className="text-body text-neutral-900 flex-shrink text-right"
                        >
                          {serviceNames || "—"}
                        </Typography>
                        {canEdit && (
                          <IconButton
                            size="xs"
                            onPress={() =>
                              router.push(
                                Routers.app.calendar.slotSelectService(
                                  serviceSelectionParams,
                                ),
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
                        )}
                      </View>
                    }
                  />

                  {(canEdit || slot.additional_services.length > 0) && (
                    <InfoRow
                      label="Доп. услуги"
                      right={
                        <View className="flex-row items-center gap-1 flex-1 justify-end">
                          <Typography
                            weight="regular"
                            className="text-body text-neutral-900 flex-shrink text-right"
                          >
                            {additionalServiceNames || "—"}
                          </Typography>
                          {canEdit && (
                            <IconButton
                              size="xs"
                              onPress={() =>
                                router.push(
                                  Routers.app.calendar.slotSelectService(
                                    serviceSelectionParams,
                                  ),
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
                          )}
                        </View>
                      }
                    />
                  )}

                  <InfoRow
                    label="Дата и время"
                    right={
                      <Typography
                        weight="regular"
                        className="text-body text-neutral-900 flex-shrink text-right"
                      >
                        {timeString}
                      </Typography>
                    }
                  />

                  <EditableRow
                    label="Длительность"
                    displayValue={`${slot.duration} мин`}
                    fieldName="duration"
                    editing={editingField === "duration"}
                    canEdit={canEdit}
                    isUpdating={isUpdating}
                    placeholder="мин"
                    onEdit={() => {
                      methods.setValue("duration", String(slot.duration));
                      setEditingField("duration");
                    }}
                    onSave={handleSave}
                  />

                  <EditableRow
                    label="Стоимость"
                    displayValue={formatRublesFromCents(slot.price_cents)}
                    fieldName="price"
                    editing={editingField === "price"}
                    canEdit={canEdit}
                    isUpdating={isUpdating}
                    placeholder="₽"
                    onEdit={() => {
                      methods.setValue(
                        "price",
                        String(centsToRubles(slot.price_cents)),
                      );
                      setEditingField("price");
                    }}
                    onSave={handleSave}
                    divider={false}
                  />
                </View>

                <View className="px-screen mt-5">
                  <RhfTextField
                    name="comment"
                    label="Комментарий к записи"
                    placeholder="Комментарий к записи"
                    multiline={true}
                    disabled={true}
                  />
                </View>

                <SlotActions
                  appointmentId={id}
                  status={slot.status}
                  onReschedule={() => setRescheduleVisible(true)}
                  onCancel={() => setCancelVisible(true)}
                />
              </ScrollView>

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
            </>
          );
        }}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default SlotDetails;
