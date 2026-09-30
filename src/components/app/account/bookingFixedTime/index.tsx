import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import {
  FormProvider,
  useController,
  useForm,
  useWatch,
} from "react-hook-form";
import { router } from "expo-router";
import { toast } from "@/src/components/ui/toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  Card,
  FloatingFooter,
  SegmentedControl,
  StSvg,
} from "@/src/components/ui";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { colors } from "@/src/styles/colors";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { useBookingFixedTime } from "@/src/hooks/useBookingFixedTime";
import { useAppDispatch } from "@/src/store/redux/store";
import { setBookingFixedTime } from "@/src/store/redux/slices/bookingFixedTimeSlice";
import {
  MODE_OPTIONS,
  type BookingFixedTimeFormValues,
  type FixedTimeMode,
} from "./constants";
import { buildGridItems, normalizeValues } from "./utils";
import IntervalField from "./IntervalField";
import FixedTimesTab from "./FixedTimesTab";
import WeeklyTimesTab from "./WeeklyTimesTab";

const BookingFixedTime = () => {
  const dispatch = useAppDispatch();
  const settings = useBookingFixedTime();
  const methods = useForm<BookingFixedTimeFormValues>({
    defaultValues: settings,
  });
  const { control, formState, reset, handleSubmit } = methods;
  const { isDirty } = formState;
  const { field: modeField } = useController({ control, name: "mode" });
  const interval = useWatch({ control, name: "interval" });
  const enabled = useWatch({ control, name: "enabled" });
  useFormNavigationGuard(isDirty);

  const gridItems = useMemo(() => buildGridItems(interval), [interval]);

  const onSubmit = (values: BookingFixedTimeFormValues) => {
    const next = normalizeValues(values);
    dispatch(setBookingFixedTime(next));
    reset(next);
    toast.success("Изменения сохранены");
    router.back();
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Фиксированное время">
        {({ topInset, bottomInset }) => (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: topInset,
                paddingBottom: bottomInset + (isDirty ? 82 : 8),
              }}
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
                  {modeField.value === "fixed" ? (
                    <FixedTimesTab gridItems={gridItems} />
                  ) : (
                    <WeeklyTimesTab gridItems={gridItems} />
                  )}
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
                  onPress={handleSubmit(onSubmit)}
                />
              </FloatingFooter>
            )}
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default BookingFixedTime;
