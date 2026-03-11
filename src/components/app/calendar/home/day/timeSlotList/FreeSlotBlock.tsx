import React from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Typography, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";

type Props = {
  date?: string;
  time: string;
  endTime: string;
};

const FreeSlotBlock: React.FC<Props> = ({ date, time, endTime }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() =>
      router.push(Routers.app.calendar.slotSelectService({ date, time }))
    }
    className="flex-1 rounded-base flex-row items-center justify-between overflow-hidden border border-neutral-200 bg-background px-4 mb-1"
  >
    <Typography className="text-body text-neutral-900">
      {time} - {endTime} · Свободное время
    </Typography>
    <StSvg name="Add_ring_fill" size={24} color={colors.neutral[900]} />
  </TouchableOpacity>
);

export default FreeSlotBlock;
