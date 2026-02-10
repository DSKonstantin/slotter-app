import React from "react";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const Calendar = () => {
  return (
    <>
      <ToolbarTop
        title="Календарь"
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Filter_alt_fill"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={() => {}}
          />
        }
      />
    </>
  );
};

export default Calendar;
