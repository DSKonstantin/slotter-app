import React, { ReactNode } from "react";
import { View } from "react-native";

import { TimeFields } from "./TimeFields";
import { BreaksFieldArray } from "./BreaksFieldArray";

type Spacing = "tight" | "default" | "loose";

const SPACING_CLASS: Record<Spacing, string> = {
  tight: "gap-2",
  default: "gap-3",
  loose: "gap-4",
};

type Props = {
  startName: string;
  endName: string;
  breaksName?: string;
  label?: string;
  startDefault?: Date;
  endDefault?: Date;
  /** Custom node rendered between TimeFields and BreaksFieldArray (e.g. helper text). */
  middleSlot?: ReactNode;
  spacing?: Spacing;
};

export const WorkingHoursFields = ({
  startName,
  endName,
  breaksName,
  label,
  startDefault,
  endDefault,
  middleSlot,
  spacing = "default",
}: Props) => (
  <View className={SPACING_CLASS[spacing]}>
    <TimeFields
      startName={startName}
      endName={endName}
      label={label}
      startDefault={startDefault}
      endDefault={endDefault}
    />
    {middleSlot}
    <BreaksFieldArray name={breaksName} />
  </View>
);
