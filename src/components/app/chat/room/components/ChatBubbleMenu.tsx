import React from "react";
import { View, Pressable } from "react-native";
import { StModal, StSvg, Typography, Divider } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { ChatIMessage } from "@/src/utils/chat/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  message: ChatIMessage | null;
  isOwnMessage: boolean;
  onReply: (message: ChatIMessage) => void;
  onCopy: (message: ChatIMessage) => void;
  onDelete: (message: ChatIMessage) => void;
};

const ChatBubbleMenu = ({
  visible,
  onClose,
  message,
  isOwnMessage,
  onReply,
  onCopy,
  onDelete,
}: Props) => {
  if (!message) return null;

  const handleReply = () => {
    onClose();
    onReply(message);
  };

  const handleCopy = () => {
    onClose();
    onCopy(message);
  };

  const handleDelete = () => {
    onClose();
    onDelete(message);
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="rounded-2xl bg-white border border-background overflow-hidden mb-4">
        <Pressable
          className="flex-row items-center gap-3 px-4 min-h-[56px] active:opacity-70"
          onPress={handleReply}
        >
          <StSvg name="Chat_plus_fill" size={20} color={colors.neutral[700]} />
          <Typography className="text-[15px]">Ответить</Typography>
        </Pressable>

        <Divider />

        <Pressable
          className="flex-row items-center gap-3 px-4 min-h-[56px] active:opacity-70"
          onPress={handleCopy}
        >
          <StSvg name="Copy_alt" size={20} color={colors.neutral[700]} />
          <Typography className="text-body">Копировать</Typography>
        </Pressable>

        {isOwnMessage && (
          <>
            <Divider />
            <Pressable
              className="flex-row items-center gap-3 px-4 min-h-[56px] active:opacity-70"
              onPress={handleDelete}
            >
              <StSvg
                name="Trash_light"
                size={20}
                color={colors.accent.red[500]}
              />
              <Typography className="text-[15px] text-red-500">
                Удалить
              </Typography>
            </Pressable>
          </>
        )}
      </View>
    </StModal>
  );
};

export default ChatBubbleMenu;
