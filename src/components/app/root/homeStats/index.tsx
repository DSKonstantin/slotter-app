import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ContentLoader, { Rect } from "react-content-loader/native";
import { skipToken } from "@reduxjs/toolkit/query";

import { SegmentedControl, Tag, Typography } from "@/src/components/ui";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useToday } from "@/src/hooks/useToday";
import { useGetFinancesSummaryQuery } from "@/src/store/redux/services/api/financesApi";
import {
  useGetUserCustomersQuery,
  useGetUserCustomersStatisticsQuery,
} from "@/src/store/redux/services/api/userCustomersApi";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { colors } from "@/src/styles/colors";

import StatsIllustration from "./StatsIllustration";

const ILLUSTRATION_BLEED = 30;

type StatTab = "clients" | "finances";

type StatBlockProps = {
  label: string;
  value: string | number;
  tagTitle?: string;
  tagVariant?: "mint" | "error";
  isLoading?: boolean;
};

const StatBlock = ({
  label,
  value,
  tagTitle,
  tagVariant,
  isLoading,
}: StatBlockProps) => (
  <>
    <View className="flex-1 justify-center gap-1">
      <Typography className="text-body text-neutral-900">{label}</Typography>
      {isLoading ? (
        <ContentLoader
          speed={1.2}
          width={96}
          height={34}
          backgroundColor="rgba(255,255,255,0.35)"
          foregroundColor="rgba(255,255,255,0.65)"
        >
          <Rect x={0} y={0} rx={8} ry={8} width={96} height={34} />
        </ContentLoader>
      ) : (
        <Typography weight="bold" className="text-4xl text-neutral-900">
          {value}
        </Typography>
      )}
    </View>

    <Tag
      title={tagTitle ?? " "}
      variant={tagVariant ?? "mint"}
      containerClassName="bg-[#DEFAA0] px-3"
      size="sm"
      containerStyle={{
        borderRadius: 16,
        opacity: tagTitle ? 1 : 0,
      }}
    />
  </>
);

const OPTIONS = [
  { label: "Клиенты", value: "clients" },
  { label: "Финансы", value: "finances" },
];

const HomeStats = () => {
  const [tab, setTab] = useState<StatTab>("clients");
  const auth = useRequiredAuth();
  const today = useToday();

  const { data: customersData, isLoading: isCustomersLoading } =
    useGetUserCustomersQuery(
      auth ? { userId: auth.userId, per_count: 1 } : skipToken,
    );
  const { data: customersStatsData } = useGetUserCustomersStatisticsQuery(
    auth
      ? { userId: auth.userId, params: { period: "current_month" } }
      : skipToken,
  );
  const { data: financesData, isLoading: isFinancesLoading } =
    useGetFinancesSummaryQuery(
      auth && tab === "finances"
        ? {
            userId: auth.userId,
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          }
        : skipToken,
    );
  const totalClients = customersData?.pagination.total_count ?? 0;
  const newClients = customersStatsData?.new_clients.count ?? 0;
  const incomeCents = financesData?.income_cents ?? 0;
  const growthPercent = financesData?.growth_percent;

  const statBlockProps: StatBlockProps = useMemo(
    () =>
      tab === "clients"
        ? {
            label: "Всего",
            value: totalClients,
            tagTitle:
              newClients > 0 ? `+${newClients} новых в этом месяце` : undefined,
            tagVariant: "mint",
            isLoading: isCustomersLoading,
          }
        : {
            label: "Доход",
            value: formatRublesFromCents(incomeCents),
            tagTitle:
              growthPercent != null && incomeCents > 0
                ? `${growthPercent > 0 ? "+" : ""}${growthPercent}% к прошлому месяцу`
                : undefined,
            tagVariant:
              growthPercent != null && growthPercent >= 0 ? "mint" : "error",
            isLoading: isFinancesLoading,
          },
    [
      tab,
      totalClients,
      newClients,
      incomeCents,
      growthPercent,
      isCustomersLoading,
      isFinancesLoading,
    ],
  );

  return (
    <View className="rounded-base overflow-hidden min-h-[192px]">
      <LinearGradient
        colors={[colors.primary.green[500], "#E1F6B1"]}
        locations={[0.4716, 0.8199]}
        start={{ x: 0.045, y: 0.293 }}
        end={{ x: 0.955, y: 0.707 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{
          position: "absolute",
          bottom: -ILLUSTRATION_BLEED,
          right: 0,
        }}
      >
        <StatsIllustration />
      </View>

      <View className="p-4 gap-2 flex-1">
        <SegmentedControl
          options={OPTIONS}
          value={tab}
          onChange={(v) => setTab(v as StatTab)}
          className="bg-[#DEFAA0] gap-1 rounded-full p-2"
          segmentClassName="rounded-full"
          activeSegmentClassName="bg-neutral-0"
          inactiveSegmentClassName="bg-neutral-0/50"
          segmentLabelClassName="text-neutral-900"
        />

        <View className="flex-row items-end justify-between flex-1">
          <View className="gap-1 flex-1">
            <StatBlock {...statBlockProps} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeStats;
