import React, { useMemo } from "react";
import { View } from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type {
  MessageTemplateConfig,
  TemplatePreviewChannel,
} from "./templateConfigs";
import type { TemplateVariable } from "./templateVariables";
import { substituteTemplate } from "./substituteTemplate";

const CHANNEL_ICON: Record<TemplatePreviewChannel, string> = {
  telegram: "SocialTelegram",
  max: "SocialTelegram",
  bot: "SocialTelegram",
};

type TemplatePreviewBubbleProps = {
  text: string;
  variables: TemplateVariable[];
  preview: MessageTemplateConfig["preview"];
};

const TemplatePreviewBubble = ({
  text,
  variables,
  preview,
}: TemplatePreviewBubbleProps) => {
  const rendered = useMemo(
    () => substituteTemplate(text, variables),
    [text, variables],
  );

  return (
    <View className="flex-row items-end gap-2">
      <StSvg
        name={CHANNEL_ICON[preview.channel]}
        size={28}
        color={colors.primary.blue[500]}
      />
      <View className="flex-1 rounded-2xl rounded-bl-sm bg-background px-3 py-2">
        <Typography
          weight="semibold"
          className="text-caption text-primary-blue-500 mb-0.5"
        >
          {preview.senderName}
        </Typography>
        <Typography className="text-body text-neutral-900">
          {rendered}
        </Typography>
        <View className="flex-row items-center justify-end gap-1 mt-1">
          <Typography className="text-caption text-neutral-400">
            {preview.time}
          </Typography>
          <StSvg
            name="Done_all_round"
            size={14}
            color={colors.primary.blue[500]}
          />
        </View>
      </View>
    </View>
  );
};

export default TemplatePreviewBubble;
