import React, { useCallback } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";

import { Typography } from "@/src/components/ui";
import MessageTemplateEditor from "./MessageTemplateEditor";
import { TEMPLATE_CONFIGS, isTemplateKind } from "./templateConfigs";

type MessageTemplateScreenProps = {
  kind?: string;
};

const MessageTemplateScreen = ({ kind }: MessageTemplateScreenProps) => {
  const config =
    kind && isTemplateKind(kind) ? TEMPLATE_CONFIGS[kind] : undefined;

  const handleSave = useCallback((text: string) => {
    void text;
    toast.success("Шаблон сохранён");
    router.back();
  }, []);

  if (!config) {
    return (
      <View className="flex-1 items-center justify-center px-screen">
        <Typography className="text-center text-error">
          Неизвестный тип шаблона
        </Typography>
      </View>
    );
  }

  return (
    <MessageTemplateEditor
      initialValue={config.defaultText}
      variables={config.variables}
      maxLength={config.maxLength}
      preview={config.preview}
      onSave={handleSave}
    />
  );
};

export default MessageTemplateScreen;
