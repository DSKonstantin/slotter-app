import React, { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatShortDayName } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { useTodaySchedule } from "@/src/hooks/useTodaySchedule";
import SpecialistHomeAssistant from "@/src/components/app/root/homeOverview/specialistHomeAssistant";

const today = new Date();
const dateChip = `Сегодня • ${formatShortDayName(today)} • ${formatDayMonth(today.toISOString())}`;

const HomeOverview = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isTodayDayOff, isReady } = useTodaySchedule();

  const toggle = useCallback(() => setIsExpanded((v) => !v), []);

  return (
    <View className="gap-3">
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between active:opacity-70"
        hitSlop={8}
      >
        <Typography weight="semibold" className="text-caption text-neutral-500">
          Показатели
        </Typography>
        <View className="relative" style={{ width: 12, height: 20 }}>
          {isExpanded ? (
            <>
              <StSvg
                name="Expand_up_light"
                size={12}
                color={colors.neutral[500]}
                style={{ position: "absolute", top: 0 }}
              />
              <View
                className="absolute bottom-0"
                style={{ transform: [{ rotate: "180deg" }] }}
              >
                <StSvg
                  name="Expand_up_light"
                  size={12}
                  color={colors.neutral[500]}
                />
              </View>
            </>
          ) : (
            <View
              className="absolute"
              style={{ top: 4, transform: [{ rotate: "180deg" }] }}
            >
              <StSvg
                name="Expand_up_light"
                size={12}
                color={colors.neutral[500]}
              />
            </View>
          )}
        </View>
      </Pressable>

      {isExpanded && (
        <>
          <View className="bg-background-card rounded-full flex-row items-center gap-2">
            <View
              className={`w-4 h-4 rounded-md ${
                !isReady
                  ? "bg-neutral-200"
                  : isTodayDayOff
                    ? "bg-accent-purple-500"
                    : "bg-primary-green-500"
              }`}
            />
            <Typography className="text-caption">{dateChip}</Typography>
          </View>

          <SpecialistHomeAssistant />
        </>
      )}
    </View>
  );
};

export default HomeOverview;
