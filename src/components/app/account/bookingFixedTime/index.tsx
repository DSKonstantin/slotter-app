import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import {
  FormProvider,
  useController,
  useForm,
  useWatch,
} from "react-hook-form";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Button,
  FloatingFooter,
  SegmentedControl,
  StSvg,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import {
  MOCK_DEFAULT_VALUES,
  MODE_OPTIONS,
  type BookingFixedTimeFormValues,
  type FixedTimeMode,
} from "./constants";
import { buildGridItems, normalizeValues } from "./utils";
import IntervalField from "./IntervalField";
import FixedTimesTab from "./FixedTimesTab";
import WeeklyTimesTab from "./WeeklyTimesTab";

const BookingFixedTime = () => {
  const methods = useForm<BookingFixedTimeFormValues>({
    defaultValues: MOCK_DEFAULT_VALUES,
  });
  const { control, formState, reset, handleSubmit } = methods;
  const { isDirty } = formState;
  const { field: modeField } = useController({ control, name: "mode" });
  const interval = useWatch({ control, name: "interval" });
  useFormNavigationGuard(isDirty);

  const gridItems = useMemo(() => buildGridItems(interval), [interval]);

  const onSubmit = (values: BookingFixedTimeFormValues) => {
    reset(normalizeValues(values));
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
