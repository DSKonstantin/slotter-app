import React, { useCallback } from "react";
import { Alert, View } from "react-native";

import { Button, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import type { Appointment } from "@/src/store/redux/services/api-types";
import {
  useConfirmAppointmentMutation,
  useArriveAppointmentMutation,
  useMarkLateAppointmentMutation,
  useMarkNoShowAppointmentMutation,
  useCompleteAppointmentMutation,
} from "@/src/store/redux/services/api/appointmentsApi";

interface Props {
  appointmentId: number;
  status: Appointment["status"];
  onReschedule: () => void;
  onCancel: () => void;
}

const SlotActions: React.FC<Props> = ({
  appointmentId,
  status,
  onReschedule,
  onCancel,
}) => {
  const canCancel = status === "pending" || status === "confirmed";
  const [confirm, { isLoading: isConfirming }] =
    useConfirmAppointmentMutation();
  const [arrive, { isLoading: isArriving }] = useArriveAppointmentMutation();
  const [markLate, { isLoading: isMarkingLate }] =
    useMarkLateAppointmentMutation();
  const [markNoShow, { isLoading: isMarkingNoShow }] =
    useMarkNoShowAppointmentMutation();
  const [complete, { isLoading: isCompleting }] =
    useCompleteAppointmentMutation();

  const handleConfirm = useCallback(() => {
    Alert.alert("Подтвердить запись?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Подтвердить",
        onPress: async () => {
          try {
            await confirm(appointmentId).unwrap();
            router.back();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось подтвердить запись"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, confirm]);

  const handleArrive = useCallback(() => {
    Alert.alert("Клиент пришёл?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Отметить",
        onPress: async () => {
          try {
            await arrive(appointmentId).unwrap();
            router.back();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось обновить статус"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, arrive]);

  const handleLate = useCallback(() => {
    Alert.alert("Клиент опоздал?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Отметить",
        onPress: async () => {
          try {
            await markLate(appointmentId).unwrap();
            router.back();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось обновить статус"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, markLate]);

  const handleNoShow = useCallback(() => {
    Alert.alert(
      "Клиент не явился?",
      "Вы можете заблокировать этому клиенту возможность самостоятельной онлайн-записи",
      [
        { text: "Не нужно", style: "cancel" },
        {
          text: "Заблокировать",
          style: "destructive",
          onPress: async () => {
            try {
              await markNoShow(appointmentId).unwrap();
              router.back();
            } catch (error) {
              toast.error(
                getApiErrorMessage(error, "Не удалось обновить статус"),
              );
            }
          },
        },
      ],
    );
  }, [appointmentId, markNoShow]);

  const handleComplete = useCallback(() => {
    Alert.alert("Завершить запись?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Завершить",
        onPress: async () => {
          try {
            await complete(appointmentId).unwrap();
            router.back();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось завершить запись"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, complete]);

  const renderActions = () => {
    switch (status) {
      case "pending":
        return (
          <>
            <Button
              title="Подтвердить"
              variant="accent"
              onPress={handleConfirm}
              loading={isConfirming}
              rightIcon={
                <StSvg
                  name="Check_round_fill"
                  size={24}
                  color={colors.neutral[0]}
                />
              }
            />
            <Button
              title="Перенести"
              variant="clear"
              rightIcon={
                <StSvg
                  name="Refund_Forward"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
              onPress={onReschedule}
            />
          </>
        );
      case "confirmed":
        return (
          <>
            <Button
              title="Клиент пришёл"
              rightIcon={
                <StSvg name="thumb_up" size={24} color={colors.neutral[0]} />
              }
              onPress={handleArrive}
              loading={isArriving}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  title="Опоздал"
                  variant="clear"
                  rightIcon={
                    <StSvg
                      name="Sad_alt_2"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  onPress={handleLate}
                  loading={isMarkingLate}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Не явился"
                  variant="clear"
                  textClassName="text-accent-red-500"
                  rightIcon={
                    <StSvg
                      name="thumb_down"
                      size={24}
                      color={colors.accent.red[500]}
                    />
                  }
                  onPress={handleNoShow}
                  loading={isMarkingNoShow}
                />
              </View>
            </View>
            <Button
              title="Перенести"
              variant="clear"
              rightIcon={
                <StSvg
                  name="Refund_Forward"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
              onPress={onReschedule}
            />
          </>
        );
      case "arrived":
        return (
          <Button
            title="Завершить"
            variant="accent"
            onPress={handleComplete}
            loading={isCompleting}
            rightIcon={
              <StSvg
                name="Check_round_fill"
                size={24}
                color={colors.neutral[0]}
              />
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="px-screen mt-1 gap-3">
      {renderActions()}
      {canCancel && (
        <Button
          title="Отменить запись"
          variant="clear"
          textClassName="text-accent-red-500"
          rightIcon={
            <StSvg name="Dell_fill" size={24} color={colors.accent.red[500]} />
          }
          onPress={onCancel}
        />
      )}
    </View>
  );
};

export default React.memo(SlotActions);
