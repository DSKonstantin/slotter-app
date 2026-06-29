import React, { memo, useCallback } from "react";
import { Alert, View } from "react-native";

import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { toast } from "@backpackapp-io/react-native-toast";
import type { Appointment } from "@/src/store/redux/services/api-types";
import {
  useUserAcceptAppointmentMutation,
  useUserDeclineAppointmentMutation,
  useArriveAppointmentMutation,
  useMarkMissedAppointmentMutation,
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
  const [userAccept, { isLoading: isAccepting }] =
    useUserAcceptAppointmentMutation();
  const [userDecline, { isLoading: isDeclining }] =
    useUserDeclineAppointmentMutation();
  const [arrive, { isLoading: isArriving }] = useArriveAppointmentMutation();

  const [markMissed, { isLoading: isMarkingMissed }] =
    useMarkMissedAppointmentMutation();
  const [complete, { isLoading: isCompleting }] =
    useCompleteAppointmentMutation();

  const handleAccept = useCallback(() => {
    Alert.alert("Принять заявку?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Принять",
        onPress: async () => {
          try {
            await userAccept(appointmentId).unwrap();
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Не удалось принять заявку"));
          }
        },
      },
    ]);
  }, [appointmentId, userAccept]);

  const handleDecline = useCallback(() => {
    Alert.alert("Отклонить заявку?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Отклонить",
        style: "destructive",
        onPress: async () => {
          try {
            await userDecline(appointmentId).unwrap();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось отклонить заявку"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, userDecline]);

  const handleArrive = useCallback(() => {
    Alert.alert("Клиент пришёл?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Пришел",
        onPress: async () => {
          try {
            await arrive(appointmentId).unwrap();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось обновить статус"),
            );
          }
        },
      },
    ]);
  }, [appointmentId, arrive]);

  const handleMissed = useCallback(() => {
    const doMissed = async () => {
      try {
        await markMissed(appointmentId).unwrap();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось обновить статус"));
      }
    };

    Alert.alert(
      "Не явился?",
      "Вы можете заблокировать этому клиенту возможность самостоятельной онлайн-записи",
      [
        { text: "Не нужно", onPress: doMissed },
        { text: "Заблокировать", style: "destructive", onPress: doMissed },
        { text: "Закрыть", style: "cancel" },
      ],
    );
  }, [appointmentId, markMissed]);

  const handleComplete = useCallback(() => {
    Alert.alert("Завершить запись?", "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Завершить",
        onPress: async () => {
          try {
            await complete(appointmentId).unwrap();
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
      case "requested":
        return (
          <>
            <Button
              title="Подтвердить запрос"
              onPress={handleAccept}
              loading={isAccepting}
            />
            <Button
              title="Отменить запрос"
              variant="clear"
              textClassName="text-accent-red-500"
              onPress={handleDecline}
              loading={isDeclining}
            />
          </>
        );
      case "pending":
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
            <Button
              title="Не пришел"
              variant="clear"
              textClassName="text-accent-red-500"
              rightIcon={
                <StSvg
                  name="thumb_down"
                  size={24}
                  color={colors.accent.red[500]}
                />
              }
              onPress={handleMissed}
              loading={isMarkingMissed}
            />
          </>
        );
      case "arrived":
      case "delayed":
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

  return <View className="px-screen mt-1 gap-3">{renderActions()}</View>;
};

export default memo(SlotActions);
