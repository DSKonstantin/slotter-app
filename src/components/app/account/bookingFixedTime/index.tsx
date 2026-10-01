import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import {
  FormProvider,
  type FieldErrors,
  useController,
  useForm,
  useWatch,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { toast } from "@/src/components/ui/toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Card,
  FloatingFooter,
  SegmentedControl,
  StSvg,
  Typography,
} from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { useRefresh } from "@/src/hooks/useRefresh";
import { useRefetchOnForeground } from "@/src/hooks/useRefetchOnForeground";
import { safeRefetch } from "@/src/utils/safeRefetch";
import { useBookingFixedTimeState } from "@/src/hooks/useBookingFixedTime";
import { useLazyGetMeQuery } from "@/src/store/redux/services/api/authApi";
import RetryInline from "@/src/components/shared/retryInline";
import { useAppSelector } from "@/src/store/redux/store";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { bookingFixedTimeToApi } from "@/src/utils/bookingFixedTimeApi";
import { bookingFixedTimeSchema } from "@/src/validation/schemas/bookingFixedTime.schema";
import {
  MODE_OPTIONS,
  type BookingFixedTimeFormValues,
  type FixedTimeMode,
} from "./constants";
import { buildGridItems } from "./utils";
import { useWorkingRanges } from "./useWorkingRanges";
import IntervalField from "./IntervalField";
import FixedTimesTab from "./FixedTimesTab";
import WeeklyTimesTab from "./WeeklyTimesTab";
import TimesSkeleton from "./TimesSkeleton";

type BookingFixedTimeFormProps = {
  settings: BookingFixedTimeFormValues;
};

const BookingFixedTimeForm = ({ settings }: BookingFixedTimeFormProps) => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const methods = useForm<BookingFixedTimeFormValues>({
    resolver: yupResolver(bookingFixedTimeSchema),
    defaultValues: settings,
  });
  const { control, formState, reset, handleSubmit } = methods;
  const { isDirty } = formState;
  const { field: modeField } = useController({ control, name: "mode" });
  const interval = useWatch({ control, name: "interval" });
  const fixedTimes = useWatch({ control, name: "fixedTimes" });
  const {
    ranges,
    isLoading: isRangesLoading,
    refetch: refetchWorkingDays,
  } = useWorkingRanges();
  const [fetchMe] = useLazyGetMeQuery();
  const enabled = useWatch({ control, name: "enabled" });
  useFormNavigationGuard(isDirty);

  const gridItems = useMemo(
    () => buildGridItems(interval, ranges.all, fixedTimes),
    [interval, ranges.all, fixedTimes],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([safeRefetch(refetchWorkingDays), fetchMe()]);
  }, [refetchWorkingDays, fetchMe]);

  const { refreshing, onRefresh } = useRefresh(refetchAll);
  useRefetchOnForeground(refetchAll);

  useEffect(() => {
    if (!isDirty) reset(settings);
  }, [settings, isDirty, reset]);

  const onSubmit = async (values: BookingFixedTimeFormValues) => {
    if (!userId) return;
    try {
      await updateUser({
        id: userId,
        data: { booking_fixed_time: bookingFixedTimeToApi(values) },
      }).unwrap();
      reset(values);
      toast.success("Изменения сохранены");
      router.back();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось сохранить настройки"));
    }
  };

  const onInvalid = (errors: FieldErrors<BookingFixedTimeFormValues>) => {
    const message = Object.values(errors)[0]?.message;
    toast.error(message || "Проверьте настройки");
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Фиксированное время">
        {({ topInset, bottomInset }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentInset={
                Platform.OS === "ios" ? { top: topInset } : undefined
              }
              contentOffset={
                Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
              }
              contentContainerStyle={{
                paddingTop: Platform.OS === "ios" ? 0 : topInset,
                paddingBottom: bottomInset + (isDirty ? 82 : 8),
              }}
              refreshControl={
                <RefreshControl
                  progressViewOffset={Platform.select({ android: topInset })}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              className="px-screen"
            >
              <View className="gap-4">
                <Card
                  title="Включить фиксированное время"
                  right={<RHFSwitch name="enabled" />}
                />
                <View
                  pointerEvents={enabled ? "auto" : "none"}
                  className={enabled ? "gap-4 opacity-100" : "gap-4 opacity-40"}
                >
                  <SegmentedControl
                    value={modeField.value}
                    options={MODE_OPTIONS}
                    onChange={(value) =>
                      modeField.onChange(value as FixedTimeMode)
                    }
                  />
                  <IntervalField />
                  {isRangesLoading ? (
                    <TimesSkeleton />
                  ) : modeField.value === "fixed" ? (
                    <FixedTimesTab gridItems={gridItems} range={ranges.all} />
                  ) : (
                    <WeeklyTimesTab interval={interval} ranges={ranges} />
                  )}
                  <Typography
                    weight="regular"
                    className="text-caption text-neutral-500"
                  >
                    Ставьте времена с запасом на длительность услуги и перерыв
                    после неё, иначе после записи соседнее время закроется
                  </Typography>
                </View>
              </View>
            </ScrollView>

            {isDirty && (
              <FloatingFooter offset={bottomInset + 8}>
                <Button
                  title="Сохранить изменения"
                  rightIcon={
                    <StSvg
                      name="Save_fill"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                  loading={isSaving}
                  onPress={handleSubmit(onSubmit, onInvalid)}
                />
              </FloatingFooter>
            )}
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

const BookingFixedTime = () => {
  const { settings, isLoaded } = useBookingFixedTimeState();
  const [fetchMe, { isSuccess, isError, isFetching }] = useLazyGetMeQuery();

  useEffect(() => {
    if (!isLoaded) fetchMe();
  }, [isLoaded, fetchMe]);

  if (isLoaded || isSuccess)
    return <BookingFixedTimeForm settings={settings} />;

  return (
    <ScreenWithToolbar title="Фиксированное время">
      {({ topInset }) => (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ paddingTop: topInset }}
        >
          {isError ? (
            <RetryInline
              text="Не удалось загрузить настройки"
              onRetry={() => fetchMe()}
              isLoading={isFetching}
              layout="column"
            />
          ) : (
            <ActivityIndicator />
          )}
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default BookingFixedTime;
