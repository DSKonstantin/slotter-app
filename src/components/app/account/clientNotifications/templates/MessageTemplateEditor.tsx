import React, { useCallback, useMemo, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import type { TemplateVariable } from "@/src/store/redux/services/api-types";

import type { TextSelection } from "./insertToken";
import { insertToken } from "./insertToken";
import { validateBody } from "./validateBody";
import VariablePicker from "./VariablePicker";
import TemplateField from "./TemplateField";
import TemplatePreviewBubble from "./TemplatePreviewBubble";

const MAX_LENGTH = 1000;

type MessageTemplateEditorProps = {
  title?: string;
  initialValue: string;
  variables: TemplateVariable[];
  senderName: string;
  isSaving?: boolean;
  serverError?: string | null;
  onSave: (text: string) => void;
};

const MessageTemplateEditor = ({
  title = "Шаблон сообщения",
  initialValue,
  variables,
  senderName,
  isSaving = false,
  serverError,
  onSave,
}: MessageTemplateEditorProps) => {
  const [text, setText] = useState(initialValue);
  const [selection, setSelection] = useState<TextSelection>({
    start: initialValue.length,
    end: initialValue.length,
  });

  const inputRef = useRef<TextInput | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const isDirty = text !== initialValue;
  useFormNavigationGuard(isDirty);

  const allowedKeys = useMemo(() => variables.map((v) => v.key), [variables]);
  const localError = useMemo(
    () => validateBody(text, allowedKeys),
    [text, allowedKeys],
  );
  const error = text.trim() ? (localError ?? serverError ?? null) : null;
  const canSave = isDirty && !localError && !isSaving;

  const handleInsert = useCallback(
    (variable: TemplateVariable) => {
      const { start, end } = selectionRef.current;
      const before = text.slice(0, start);
      const after = text.slice(end);
      const leading = before && !/\s$/.test(before) ? " " : "";
      const trailing = after && !/^\s/.test(after) ? " " : "";

      const result = insertToken(
        text,
        selectionRef.current,
        `${leading}{{${variable.key}}}${trailing}`,
        MAX_LENGTH,
      );
      setText(result.text);
      setSelection(result.selection);
      inputRef.current?.focus();
    },
    [text],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave(text);
  }, [canSave, onSave, text]);

  return (
    <ScreenWithToolbar
      title={title}
      rightButton={
        <IconButton
          onPress={handleSave}
          disabled={!canSave}
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
            <View className="flex-row items-center justify-between mb-2">
              <Typography className="text-caption text-neutral-500">
                Переменные
              </Typography>
              <Typography className="text-caption text-neutral-500">
                Нажмите чтобы вставить
              </Typography>
            </View>
            <View className="bg-background-surface rounded-base p-4 mb-2 gap-4">
              <VariablePicker variables={variables} onInsert={handleInsert} />
              <View className="bg-background rounded-small p-3">
                <TemplateField
                  inputRef={inputRef}
                  value={text}
                  onChangeText={setText}
                  selection={selection}
                  onSelectionChange={setSelection}
                  maxLength={MAX_LENGTH}
                  error={error}
                />
              </View>
            </View>

            <Typography className="text-caption text-neutral-500 mb-2">
              Превью
            </Typography>
            <View className="bg-background-surface rounded-base p-4">
              <TemplatePreviewBubble
                text={text}
                variables={variables}
                senderName={senderName}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default MessageTemplateEditor;
