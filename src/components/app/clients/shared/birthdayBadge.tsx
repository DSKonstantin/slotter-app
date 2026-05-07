import React from "react";
import { Badge, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const BirthdayBadge = () => {
  return (
    <Badge
      title="День рождения!"
      variant="tertiary"
      className="rounded-xl border-0"
      textStyle={{
        color: colors.primary.blue[500],
      }}
      size="sm"
      icon={
        <StSvg name="gift_alt" size={14} color={colors.primary.blue[500]} />
      }
    />
  );
};

export default BirthdayBadge;
