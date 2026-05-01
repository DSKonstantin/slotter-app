import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  SlotDetailsSchema,
  type SlotDetailsFormValues,
} from "@/src/validation/schemas/slotDetails.schema";
import {
  View,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { Avatar, Badge, Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  useGetAppointmentQuery,
  useUpdateAppointmentMutation,
} from "@/src/store/redux/services/api/appointmentsApi";
import { useCreateChatRoomMutation } from "@/src/store/redux/services/api/chatRoomsApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import CancelModal from "@/src/components/app/calendar/slot/cancelModal";
import RescheduleModal from "@/src/components/app/calendar/slot/rescheduleModal";
import SlotActions from "@/src/components/app/calendar/slot/slotActions";
import { formatDayMonth, formatTimeString } from "@/src/utils/date/formatTime";
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
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useRefresh } from "@/src/hooks/useRefresh";

type EditingField = "duration" | "price" | "comment" | null;

interface Props {
  slotId: string;
}

const SlotDetails: React.FC<Props> = ({ slotId }) => {
  const auth = useRequiredAuth();
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const isSavingRef = useRef(false);

  const {
    data: slot,
    isLoading,
    isError,
    refetch,
  } = useGetAppointmentQuery(Number(slotId), {
    refetchOnMountOrArgChange: true,
  });

  const { refreshing, onRefresh } = useRefresh(refetch);

  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();
  const [createChatRoom, { isLoading: isChatCreating }] =
    useCreateChatRoomMutation();

  const handleOpenChat = async () => {
    if (!auth || !slot?.customer) return;
    try {
      const room = await createChatRoom({
        userId: auth.userId,
        customerId: slot.customer.id,
      }).unwrap();
      const chatRoute = Routers.app.chat.room(room.id);
      const slotRoute = Routers.app.calendar.slot(slotId);
      router.push({
        pathname: chatRoute.pathname,
        params: {
          ...chatRoute.params,
          backTo: slotRoute.pathname.replace("[id]", slotId),
        },
      });
    } catch {
      toast.error("Не удалось открыть чат");
    }
  };

  const methods = useForm<SlotDetailsFormValues>({
    resolver: yupResolver(SlotDetailsSchema),
    defaultValues: { comment: "", duration: "", price: "" },
  });

  const id = Number(slotId);

  const handleSave = async () => {
    if (!slot || !editingField) return;
    if (isSavingRef.current) return;

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

    if (editingField === "comment") {
      const comment = methods.getValues("comment");
      if (comment === (slot.comment ?? "")) {
        setEditingField(null);
        return;
      }
    }

    isSavingRef.current = true;
    try {
      await updateAppointment({
        id,
        body:
          editingField === "duration"
            ? { duration }
            : editingField === "price"
              ? { price_cents: rublesToCents(price) }
              : { comment: methods.getValues("comment") },
      }).unwrap();
      toast.success("Сохранено");
      setEditingField(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить"));
    } finally {
      isSavingRef.current = false;
    }
  };

  const derived = useMemo(() => {
    if (!slot) return null;
    return {
      canEdit: (EDITABLE_STATUSES as readonly string[]).includes(slot.status),
      statusConfig: STATUS_CONFIG[slot.status] ?? null,
      timeString: `${formatDayMonth(slot.date)}, ${formatTimeString(slot.start_time)}`,
      serviceNames: slot.services.map((s) => s.name).join(", "),
      additionalServiceNames: slot.additional_services
        .map((s) => s.name)
        .join(", "),
      serviceSelectionParams: {
        date: slot.date,
        time: slot.start_time,
        appointmentId: String(slot.id),
        selectedServiceIds: slot.services.map((s) => s.id).join(","),
        selectedAdditionalServiceIds: slot.additional_services
          .map((s) => s.id)
          .join(","),
      },
    };
  }, [slot]);

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

          if (isError) {
            return (
              <ErrorScreen
                title="Не удалось загрузить запись"
                isLoading={isLoading}
                onRetry={refetch}
              />
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
          return (
            <>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bottomOffset={BOTTOM_OFFSET}
                contentContainerStyle={{ paddingBottom: bottomInset + 16 }}
                style={{ marginTop: topInset }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                <View className="px-screen gap-5">
                  <Card
                    title={slot.customer?.name ?? "—"}
                    subtitle={slot.customer?.phone ?? undefined}
                    onPress={() => {}}
                    left={
                      <Avatar
                        name={slot.customer?.name ?? undefined}
                        uri={slot.customer?.avatar_url ?? undefined}
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

                  <Card
                    title="Написать"
                    titleProps={{
                      style: {
                        color: colors.primary.blue[500],
                      },
                    }}
                    subtitle="Перейти в чат"
                    onPress={handleOpenChat}
                    left={
                      <View className="mb-[18px]">
                        <StSvg
                          name="Chat_plus_fill"
                          size={24}
                          color={colors.primary.blue[500]}
                        />
                      </View>
                    }
                    right={
                      isChatCreating ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.neutral[500]}
                        />
                      ) : (
                        <StSvg
                          name="Expand_right_light"
                          size={24}
                          color={colors.neutral[500]}
                        />
                      )
                    }
                  />
                </View>

                <View className="mx-screen gap-2 mt-5 bg-background-surface rounded-base p-5">
                  {derived!.statusConfig && (
                    <InfoRow
                      label="Статус"
                      right={
                        <Badge
                          size="sm"
                          title={derived!.statusConfig.label}
                          variant={derived!.statusConfig.variant}
                          icon={derived!.statusConfig.icon}
                        />
                      }
                    />
                  )}

                  <InfoRow
                    label="Услуга"
                    right={
                      <Pressable
                        onPress={
                          derived!.canEdit
                            ? () =>
                                router.push(
                                  Routers.app.calendar.slotSelectService({
                                    ...derived!.serviceSelectionParams,
                                    mode: "services",
                                  }),
                                )
                            : undefined
                        }
                        disabled={!derived!.canEdit}
                        hitSlop={8}
                        className="flex-row items-center gap-1 flex-1 justify-end active:opacity-70"
                      >
                        <Typography
                          weight="regular"
                          className="text-body text-neutral-900 flex-shrink text-right"
                        >
                          {derived!.serviceNames || "—"}
                        </Typography>
                        {derived!.canEdit && (
                          <StSvg
                            name="Edit_light"
                            size={20}
                            color={colors.neutral[500]}
                          />
                        )}
                      </Pressable>
                    }
                  />

                  {(derived!.canEdit ||
                    slot.additional_services.length > 0) && (
                    <InfoRow
                      label="Доп. услуги"
                      right={
                        <Pressable
                          onPress={
                            derived!.canEdit
                              ? () =>
                                  router.push(
                                    Routers.app.calendar.slotSelectService({
                                      ...derived!.serviceSelectionParams,
                                      mode: "additional",
                                    }),
                                  )
                              : undefined
                          }
                          disabled={!derived!.canEdit}
                          hitSlop={8}
                          className="flex-row items-center gap-1 flex-1 justify-end active:opacity-70"
                        >
                          <Typography
                            weight="regular"
                            className="text-body text-neutral-900 flex-shrink text-right"
                          >
                            {derived!.additionalServiceNames || "—"}
                          </Typography>
                          {derived!.canEdit && (
                            <StSvg
                              name="Edit_light"
                              size={20}
                              color={colors.neutral[500]}
                            />
                          )}
                        </Pressable>
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
                        {derived!.timeString}
                      </Typography>
                    }
                  />

                  <EditableRow
                    label="Длительность"
                    displayValue={`${slot.duration} мин`}
                    fieldName="duration"
                    editing={editingField === "duration"}
                    canEdit={derived!.canEdit}
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
                    canEdit={derived!.canEdit}
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

                <View className="px-screen my-5">
                  <Typography className="text-caption text-neutral-500 mb-2">
                    Комментарий к записи
                  </Typography>
                  <RhfTextField
                    name="comment"
                    placeholder="Оставьте комментарий"
                    multiline={true}
                    numberOfLines={4}
                    disabled={!derived!.canEdit}
                    hideErrorText
                    onFocus={() => setEditingField("comment")}
                    onBlur={() => {
                      const comment = methods.getValues("comment");
                      if (comment === (slot.comment ?? "")) {
                        setEditingField(null);
                        return;
                      }
                      void handleSave();
                    }}
                  />
                </View>

                <SlotActions
                  appointmentId={id}
                  status={slot.status}
                  onReschedule={() => setRescheduleVisible(true)}
                  onCancel={() => setCancelVisible(true)}
                />
              </KeyboardAwareScrollView>

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
