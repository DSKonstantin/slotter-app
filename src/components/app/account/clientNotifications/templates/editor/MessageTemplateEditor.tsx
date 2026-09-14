import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import type { TemplateVariable } from "@/src/store/redux/services/api-types";

import type { TextSelection } from "../tokenText/insertToken";
import { insertToken } from "../tokenText/insertToken";
import { collapseTokenOnDelete } from "../tokenText/collapseTokenOnDelete";
import { getActiveTokenTrigger } from "../tokenText/activeTokenTrigger";
import { validateBody } from "../tokenText/validateBody";
import VariablePicker from "./VariablePicker";
import TemplateField from "./TemplateField";
import TemplatePreviewBubble from "./TemplatePreviewBubble";

const MAX_LENGTH = 1000;

type MessageTemplateEditorProps = {
  title?: string;
  initialValue: string;
  fallbackPreview: string;
  variables: TemplateVariable[];
  senderName: string;
  isSaving?: boolean;
  bypassGuard?: boolean;
  serverError?: string | null;
  onSave: (text: string) => void;
  onReset?: () => void;
  isResetting?: boolean;
};

const MessageTemplateEditor = ({
  title = "Шаблон сообщения",
  initialValue,
  fallbackPreview,
  variables,
  senderName,
  isSaving = false,
  bypassGuard = false,
  serverError,
  onSave,
  onReset,
  isResetting = false,
}: MessageTemplateEditorProps) => {
  const [text, setText] = useState(initialValue);
  const [selection, setSelection] = useState<TextSelection>({
    start: initialValue.length,
    end: initialValue.length,
  });

  const inputRef = useRef<TextInput | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const isDirty = !bypassGuard && text !== initialValue;
  useFormNavigationGuard(isDirty);

  const allowedKeys = useMemo(() => variables.map((v) => v.key), [variables]);
  const localError = useMemo(
    () => validateBody(text, allowedKeys),
    [text, allowedKeys],
  );
  const error = text.trim() ? (localError ?? serverError ?? null) : null;
  const canSave = isDirty && !localError && !isSaving;
  const previewText = text.trim() ? text : fallbackPreview;

  const activeTrigger = useMemo(
    () =>
      selection.start === selection.end
        ? getActiveTokenTrigger(text, selection.start)
        : null,
    [text, selection],
  );
  const filteredVariables = useMemo(() => {
    if (!activeTrigger || !activeTrigger.query) return variables;
    const q = activeTrigger.query.toLowerCase();
    return variables.filter(
      (v) =>
        v.key.toLowerCase().includes(q) || v.title.toLowerCase().includes(q),
    );
  }, [variables, activeTrigger]);

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

  const handleCompleteTrigger = useCallback(
    (variable: TemplateVariable) => {
      if (!activeTrigger) return;
      const cursor = selectionRef.current.start;
      const before = text.slice(0, activeTrigger.start);
      const after = text.slice(cursor);
      const leading = before && !/\s$/.test(before) ? " " : "";
      const trailing = after && !/^\s/.test(after) ? " " : "";

      const result = insertToken(
        text,
        { start: activeTrigger.start, end: cursor },
        `${leading}{{${variable.key}}}${trailing}`,
        MAX_LENGTH,
      );
      setText(result.text);
      setSelection(result.selection);
      inputRef.current?.focus();
    },
    [text, activeTrigger],
  );

  const handleChangeText = useCallback(
    (newText: string) => {
      const collapsed = collapseTokenOnDelete(text, newText);
      if (collapsed) {
        setText(collapsed.text);
        setSelection(collapsed.selection);
        return;
      }
      setText(newText);
    },
    [text],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave(text);
  }, [canSave, onSave, text]);

  const handleResetPress = useCallback(() => {
    if (!onReset) return;
    Alert.alert(
      "Сбросить шаблон?",
      "Текст вернётся к стандартному, ваша версия будет удалена.",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Сбросить", style: "destructive", onPress: onReset },
      ],
    );
  }, [onReset]);

  useEffect(() => {
    setText(initialValue);
    setSelection({ start: initialValue.length, end: initialValue.length });
  }, [initialValue]);

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
                {activeTrigger && filteredVariables.length === 0
                  ? "Совпадений нет"
                  : "Нажмите чтобы вставить"}
              </Typography>
            </View>
            <View className="bg-background-surface rounded-base p-4 mb-2 gap-4">
              <VariablePicker
                variables={filteredVariables}
                onInsert={activeTrigger ? handleCompleteTrigger : handleInsert}
              />
              <View className="bg-background rounded-small p-3">
                <TemplateField
                  inputRef={inputRef}
                  value={text}
                  onChangeText={handleChangeText}
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
                text={previewText}
                variables={variables}
                senderName={senderName}
              />
            </View>

            {onReset && (
              <Button
                title="Сбросить к стандартному шаблону"
                variant="clear"
                textClassName="text-accent-red-500"
                onPress={handleResetPress}
                loading={isResetting}
                disabled={isResetting}
              />
            )}
          </View>
        </KeyboardAwareScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default MessageTemplateEditor;
