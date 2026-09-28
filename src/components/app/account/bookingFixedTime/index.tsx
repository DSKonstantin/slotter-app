import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { SegmentedControl, toast } from "@/src/components/ui";
import { FormSaveFooter } from "@/src/components/hookForm/FormSaveFooter";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import {
  MOCK_DEFAULT_VALUES,
  MODE_OPTIONS,
  type BookingFixedTimeFormValues,
  type FixedTimeMode,
} from "./constants";
import { buildGridItems } from "./utils";
import IntervalField from "./IntervalField";
import FixedTimesTab from "./FixedTimesTab";
import WeeklyTimesTab from "./WeeklyTimesTab";

const BookingFixedTime = () => {
  const methods = useForm<BookingFixedTimeFormValues>({
    defaultValues: MOCK_DEFAULT_VALUES,
  });
  const { control, formState, setValue, reset, handleSubmit } = methods;
  const [mode, interval] = useWatch({ control, name: ["mode", "interval"] });
  useFormNavigationGuard(formState.isDirty);

  const gridItems = useMemo(() => buildGridItems(interval), [interval]);

  const onSubmit = (values: BookingFixedTimeFormValues) => {
    reset(values);
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
                paddingBottom: 16,
              }}
              className="px-screen"
            >
              <View className="gap-4">
                <SegmentedControl
                  value={mode}
                  options={MODE_OPTIONS}
                  onChange={(value) =>
                    setValue("mode", value as FixedTimeMode, {
                      shouldDirty: true,
                    })
                  }
                />
                <IntervalField />
                {mode === "fixed" ? (
                  <FixedTimesTab gridItems={gridItems} />
                ) : (
                  <WeeklyTimesTab gridItems={gridItems} />
                )}
              </View>
            </ScrollView>

            <FormSaveFooter
              bottomInset={bottomInset}
              onPress={handleSubmit(onSubmit)}
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default BookingFixedTime;
