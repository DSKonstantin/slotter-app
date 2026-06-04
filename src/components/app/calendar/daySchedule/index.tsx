import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { FormProvider, Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import { skipToken } from "@reduxjs/toolkit/query";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import {
  useGetWorkingDayQuery,
  useUpdateWorkingDayMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { WorkingDay } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatTimeFromISO } from "@/src/utils/date/formatTime";
import { formatFullDateWithDay } from "@/src/utils/date/formatDate";
import { useRefresh } from "@/src/hooks/useRefresh";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Divider, FloatingFooter, StSvg } from "@/src/components/ui";
import {
  DayScheduleSchema,
  type DayScheduleFormValues,
} from "@/src/validation/schemas/daySchedule.schema";
import { DayScheduleForm } from "./DayScheduleForm";
import DayScheduleAppointments from "@/src/components/app/calendar/daySchedule/DayScheduleAppointments";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/styles/colors";

type DayScheduleEditProps = {
  workingDay: WorkingDay;
  userId: number;
  topInset: number;
  bottomInset: number;
  refetchWorkingDay: () => void;
};

const DayScheduleEdit = ({
  workingDay,
  userId,
  topInset,
  bottomInset,
  refetchWorkingDay,
}: DayScheduleEditProps) => {
  const breaks = (workingDay.working_day_breaks ?? []).map((b) => ({
    id: b.id,
    start: formatTimeFromISO(b.start_at),
    end: formatTimeFromISO(b.end_at),
  }));

  const initialBreakIds = useRef<number[]>(breaks.map((b) => b.id));
  const prevIsActiveRef = useRef(workingDay.is_active);

  const [updateWorkingDay, { isLoading }] = useUpdateWorkingDayMutation();

  const { refetch: refetchAppointments } = useGetAppointmentsQuery({
    userId,
    params: { date: workingDay.day },
  });

  const { refreshing, onRefresh } = useRefresh(() =>
    Promise.all([refetchWorkingDay(), refetchAppointments()]),
  );

  const methods = useForm<DayScheduleFormValues>({
    resolver: yupResolver(DayScheduleSchema) as Resolver<DayScheduleFormValues>,
    defaultValues: {
      isActive: workingDay.is_active,
      date: formatFullDateWithDay(new Date(workingDay.day)),
      startAt: formatTimeFromISO(workingDay.start_at),
      endAt: formatTimeFromISO(workingDay.end_at),
      breaks,
    },
  });

  const { handleSubmit, control } = methods;
  const isActive = useWatch({ control, name: "isActive" });

  useEffect(() => {
    const prev = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;

    if (prev && !isActive) {
      Alert.alert(
        "Сделать день выходным?",
        "День будет отмечен как нерабочий и сохранён",
        [
          {
            text: "Отмена",
            style: "cancel",
            onPress: () => methods.setValue("isActive", true),
          },
          {
            text: "Сохранить",
            onPress: async () => {
              try {
                await updateWorkingDay({
                  userId,
                  id: workingDay.id,
                  data: {
                    is_active: false,
                    start_at: workingDay.start_at,
                    end_at: workingDay.end_at,
                    working_day_breaks_attributes: (
                      workingDay.working_day_breaks ?? []
                    ).map((b) => ({
                      id: b.id,
                      start_at: b.start_at,
                      end_at: b.end_at,
                    })),
                  },
                }).unwrap();
                router.back();
              } catch (e) {
                toast.error(getApiErrorMessage(e, "Ошибка сохранения"));
                methods.setValue("isActive", true);
              }
            },
          },
        ],
      );
    }
  }, [isActive]);

  const onSubmit = async (data: DayScheduleFormValues) => {
    try {
      await updateWorkingDay({
        userId,
        id: workingDay.id,
        data: {
          start_at: data.startAt,
          end_at: data.endAt,
          is_active: data.isActive,
          working_day_breaks_attributes: [
            ...(data.breaks ?? []).map((b) => ({
              id: b.id,
              start_at: b.start,
              end_at: b.end,
            })),
            ...initialBreakIds.current
              .filter((id) => !data.breaks?.some((b) => b.id === id))
              .map((id) => ({ id, _destroy: true as const })),
          ],
        },
      }).unwrap();
      router.back();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Ошибка сохранения"));
    }
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
        <ScrollView
          className="flex-1 px-screen"
          contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
          contentOffset={
            Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
          }
          contentContainerStyle={{
            paddingTop: Platform.OS === "ios" ? 0 : topInset,
            paddingBottom: bottomInset + 82,
          }}
          refreshControl={
            <RefreshControl
              progressViewOffset={Platform.select({ android: topInset })}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <DayScheduleForm />
          <View
            pointerEvents={!isActive ? "none" : "auto"}
            className={!isActive ? "opacity-40" : "opacity-100"}
          >
            <Divider className="my-5" />
            <DayScheduleAppointments userId={userId} date={workingDay.day} />
          </View>
        </ScrollView>
      </SafeAreaView>
      <FloatingFooter offset={bottomInset + 8}>
        <Button
          title="Сохранить изменения"
          loading={isLoading}
          disabled={isLoading}
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
          onPress={handleSubmit(onSubmit)}
        />
      </FloatingFooter>
    </FormProvider>
  );
};

const CalendarDaySchedule = ({ workingDayId }: { workingDayId: number }) => {
  const auth = useRequiredAuth();

  const {
    data: workingDay,
    isLoading,
    isError,
    refetch,
  } = useGetWorkingDayQuery(
    auth ? { userId: auth.userId, id: workingDayId } : skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Настроить день">
      {({ topInset, bottomInset }) => {
        if (isLoading) {
          return (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          );
        }

        if (isError || !workingDay) {
          return (
            <ErrorScreen
              title="Не удалось загрузить данные дня"
              isLoading={isLoading}
              onRetry={refetch}
            />
          );
        }

        return (
          <DayScheduleEdit
            workingDay={workingDay}
            userId={auth.userId}
            topInset={topInset}
            bottomInset={bottomInset}
            refetchWorkingDay={refetch}
          />
        );
      }}
    </ScreenWithToolbar>
  );
};

export default CalendarDaySchedule;
