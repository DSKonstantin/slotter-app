import React, { useMemo } from "react";
import { View } from "react-native";
import { format } from "date-fns";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { TemplateVariable } from "@/src/store/redux/services/api-types";
import { renderPreview } from "../tokenText/renderPreview";

type TemplatePreviewBubbleProps = {
  text: string;
  variables: TemplateVariable[];
  senderName: string;
};

const TemplatePreviewBubble = ({
  text,
  variables,
  senderName,
}: TemplatePreviewBubbleProps) => {
  const rendered = useMemo(
    () => renderPreview(text, variables),
    [text, variables],
  );

  const time = useMemo(() => format(new Date(), "HH:mm"), []);

  return (
    <View className="flex-row items-end gap-1">
      <View className="bg-neutral-100 rounded-full w-[28px] h-[28px] items-center justify-center">
        <StSvg name="Arrow_drop_up" size={24} color={colors.neutral[900]} />
      </View>

      <View className="flex-1 rounded-2xl rounded-bl-sm bg-background px-3 py-2">
        <Typography
          weight="semibold"
          className="text-caption text-primary-blue-500 mb-0.5"
        >
          {senderName}
        </Typography>
        <Typography className="text-body text-neutral-900">
          {rendered}
        </Typography>
        <View className="flex-row items-center justify-end gap-1 mt-1">
          <Typography className="text-caption text-neutral-400">
            {time}
          </Typography>
          <StSvg name="Done_all_round" size={14} color={colors.neutral[400]} />
        </View>
      </View>
    </View>
  );
};

export default TemplatePreviewBubble;
