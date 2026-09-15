import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { Button, Item, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatShortDateRange } from "@/src/utils/date/formatDate";
import { rangeToDatePair, type DateRange } from "@/src/utils/date/dateRange";
import type { AudienceFilters } from "./types";
import { InlineNumberRow } from "./InlineNumberRow";
import { VisitsFilter } from "./VisitsFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { CategoriesFilter } from "./CategoriesFilter";

type Screen = "root" | "visits" | "visitDate" | "birthDate" | "categories";

type Props = {
  visible: boolean;
  value: AudienceFilters;
  onClose: () => void;
  onApply: (filters: AudienceFilters) => void;
};

const SCREEN_TITLES: Record<Screen, string> = {
  root: "Фильтр",
  visits: "Количество визитов",
  visitDate: "Дата визита",
  birthDate: "Дата рождения",
  categories: "Категории клиентов",
};

const formatVisits = (visits: AudienceFilters["visits"]) => {
  if (!visits || (visits.from == null && visits.to == null)) return null;
  if (visits.from != null && visits.to != null)
    return `${visits.from}–${visits.to}`;
  if (visits.from != null) return `от ${visits.from}`;
  return `до ${visits.to}`;
};

const formatDateRange = (range: DateRange | undefined) => {
  const pair = rangeToDatePair(range);
  return pair ? formatShortDateRange(...pair) : null;
};

type NavRowProps = {
  title: string;
  value: string | null;
  onPress: () => void;
};

const NavRow = ({ title, value, onPress }: NavRowProps) => (
  <Item
    title={title}
    onPress={onPress}
    className="min-h-[52px] rounded-none border-0 bg-transparent p-0"
    right={
      <View className="flex-row items-center gap-1">
        {value != null && (
          <Typography className="text-body text-neutral-500">
            {value}
          </Typography>
        )}
        <StSvg
          name="Expand_right_light"
          size={24}
          color={colors.neutral[300]}
        />
      </View>
    }
  />
);

export const AudienceFilterModal = ({
  visible,
  value,
  onClose,
  onApply,
}: Props) => {
  const [screen, setScreen] = useState<Screen>("root");
  const wasVisible = useRef(visible);
  const methods = useForm<AudienceFilters>({ defaultValues: value });
  const { control, setValue, getValues, reset } = methods;
  const filters = useWatch({ control }) as AudienceFilters;

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!justOpened) return;
    reset(value);
    setScreen("root");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const isRoot = screen === "root";

  const setField = <K extends keyof AudienceFilters>(
    key: K,
    val: AudienceFilters[K],
  ) => setValue(key as never, val as never, { shouldDirty: true });

  const handleApply = () => {
    onApply(getValues());
    onClose();
  };

  const handleReset = () => {
    switch (screen) {
      case "root":
        return reset({});
      case "visits":
        return setField("visits", undefined);
      case "visitDate":
        return setField("visitDate", undefined);
      case "birthDate":
        return setField("birthDate", undefined);
      case "categories":
        return setField("categoryIds", undefined);
    }
  };

  return (
    <FormProvider {...methods}>
      <StModal
        visible={visible}
        onClose={onClose}
        keyboardAware
        headerLeft={{
          icon: (
            <StSvg name="Arrow_left" size={24} color={colors.neutral[900]} />
          ),
          onPress: isRoot ? onClose : () => setScreen("root"),
          accessibilityLabel: "Назад",
        }}
        headerRight={{
          icon: (
            <StSvg
              name="Done_round"
              size={24}
              color={colors.primary.blue[500]}
            />
          ),
          onPress: isRoot ? handleApply : () => setScreen("root"),
          accessibilityLabel: "Готово",
        }}
        header={
          <Typography
            weight="semibold"
            className="text-[20px] text-neutral-900 text-center mb-2"
          >
            {SCREEN_TITLES[screen]}
          </Typography>
        }
      >
        {isRoot && (
          <>
            <InlineNumberRow
              title="Потрачено более"
              value={filters.spentMoreThan}
              onChange={(v) => setField("spentMoreThan", v)}
            />
            <InlineNumberRow
              title="Средний чек более"
              value={filters.avgCheckMoreThan}
              onChange={(v) => setField("avgCheckMoreThan", v)}
            />
            <NavRow
              title="Количество визитов"
              value={formatVisits(filters.visits)}
              onPress={() => setScreen("visits")}
            />
            <NavRow
              title="Дата визита"
              value={formatDateRange(filters.visitDate)}
              onPress={() => setScreen("visitDate")}
            />
            <NavRow
              title="Дата рождения"
              value={formatDateRange(filters.birthDate)}
              onPress={() => setScreen("birthDate")}
            />
            <NavRow
              title="Категории клиентов"
              value={
                filters.categoryIds?.length
                  ? String(filters.categoryIds.length)
                  : "Все"
              }
              onPress={() => setScreen("categories")}
            />
          </>
        )}

        {screen === "visits" && (
          <VisitsFilter
            value={filters.visits}
            onChange={(v) => setField("visits", v)}
          />
        )}

        {screen === "visitDate" && (
          <DateRangeFilter
            value={filters.visitDate}
            onChange={(v) => setField("visitDate", v)}
          />
        )}

        {screen === "birthDate" && (
          <DateRangeFilter
            value={filters.birthDate}
            onChange={(v) => setField("birthDate", v)}
          />
        )}

        {screen === "categories" && (
          <CategoriesFilter
            value={filters.categoryIds}
            onChange={(v) => setField("categoryIds", v)}
          />
        )}

        <Button
          title="Сбросить фильтры"
          variant="clear"
          textClassName="text-accent-red-500"
          onPress={handleReset}
          buttonClassName="mt-2"
        />
      </StModal>
    </FormProvider>
  );
};
