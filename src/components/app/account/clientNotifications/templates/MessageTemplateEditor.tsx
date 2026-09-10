import React, { useCallback, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

import type { MessageTemplateConfig } from "./templateConfigs";
import type { TemplateVariable } from "./templateVariables";
import { insertToken } from "./insertToken";
import VariablePicker from "./VariablePicker";
import TemplateField from "./TemplateField";
import TemplatePreviewBubble from "./TemplatePreviewBubble";

type Selection = { start: number; end: number };

type MessageTemplateEditorProps = {
  title?: string;
  initialValue: string;
  variables: TemplateVariable[];
  maxLength: number;
  preview: MessageTemplateConfig["preview"];
  isSaving?: boolean;
  onSave: (text: string) => void;
};

const MessageTemplateEditor = ({
  title = "Шаблон сообщения",
  initialValue,
  variables,
  maxLength,
  preview,
  isSaving = false,
  onSave,
}: MessageTemplateEditorProps) => {
  const [text, setText] = useState(initialValue);
  const [selection, setSelection] = useState<Selection>({
    start: initialValue.length,
    end: initialValue.length,
  });

  const inputRef = useRef<TextInput | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const isDirty = text !== initialValue;
  useFormNavigationGuard(isDirty);

  const handleInsert = useCallback(
    (variable: TemplateVariable) => {
      const result = insertToken(
        text,
        selectionRef.current,
        variable.token,
        maxLength,
      );
      setText(result.text);
      setSelection(result.selection);
      inputRef.current?.focus();
    },
    [text, maxLength],
  );

  const handleSave = useCallback(() => {
    if (!isDirty || isSaving) return;
    onSave(text);
  }, [isDirty, isSaving, onSave, text]);

  return (
    <ScreenWithToolbar
      title={title}
      rightButton={
        <IconButton
          onPress={handleSave}
          disabled={!isDirty || isSaving}
          icon={
            <StSvg name="Done_round" size={24} color={colors.neutral[900]} />
          }
        />
      }
    >
      {({ topInset, bottomInset }) => (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          bottomOffset={BOTTOM_OFFSET}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
          }}
        >
          <View className="px-screen">
            <Typography className="text-caption text-neutral-500 mb-2">
              Переменные
            </Typography>
            <View className="bg-background-surface rounded-base p-4 mb-5 gap-4">
              <VariablePicker variables={variables} onInsert={handleInsert} />
              <TemplateField
                inputRef={inputRef}
                value={text}
                onChangeText={setText}
                selection={selection}
                onSelectionChange={setSelection}
                maxLength={maxLength}
              />
            </View>

            <Typography className="text-caption text-neutral-500 mb-2">
              Превью
            </Typography>
            <View className="bg-background-surface rounded-base p-4">
              <TemplatePreviewBubble
                text={text}
                variables={variables}
                preview={preview}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default MessageTemplateEditor;
