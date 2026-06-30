import React, { memo, useState } from "react";
import { View } from "react-native";
import { Button, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { UpcomingAppointment } from "@/src/store/redux/services/api-types";
import WaitingNext from "./WaitingNext";

type Props = {
  appointments: UpcomingAppointment[];
};

function WaitingNextWithMoreComponent({ appointments }: Props) {
  const [expanded, setExpanded] = useState(false);
  const list = Array.isArray(appointments) ? appointments : [];
  const rest = list.slice(1);

  const first = list[0];
  const now = new Date();
  const isNow =
    !!first &&
    new Date(first.start_time) <= now &&
    now <= new Date(first.end_time);

  if (!isNow || rest.length === 0) return null;

  return (
    <View className="gap-1">
      <Button
        title={expanded ? "Спрятать" : "Показать больше"}
        size="xs"
        variant="clear"
        buttonClassName="gap-1 self-start px-0"
        textClassName="text-neutral-500 text-[13px]"
        onPress={() => setExpanded((v) => !v)}
        rightIcon={
          <StSvg
            name={expanded ? "Expand_up_light" : "Expand_down_light"}
            size={16}
            color={colors.neutral[500]}
          />
        }
      />
      {expanded && <WaitingNext appointments={rest} label="следующая" />}
    </View>
  );
}

export default memo(WaitingNextWithMoreComponent);
