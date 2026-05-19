import React from "react";
import { LayoutChangeEvent, View } from "react-native";
import { InputToolbarProps } from "react-native-gifted-chat";
import { FadeOverlay, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { ChatIMessage } from "@/src/utils/chat/types";
import ChatInputToolbar from "./ChatInputToolbar";
import ChatReplyFooter from "./ChatReplyFooter";

type Props = InputToolbarProps<ChatIMessage> & {
  replyingTo: ChatIMessage | null;
  onCancelReply: () => void;
  onOpenAttachMenu: () => void;
  onHeightChange: (height: number) => void;
};

const ChatInputBar = ({
  replyingTo,
  onCancelReply,
  onOpenAttachMenu,
  onHeightChange,
  ...toolbarProps
}: Props) => {
  const handleLayout = (e: LayoutChangeEvent) => {
    onHeightChange(e.nativeEvent.layout.height);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-screen pb-safe bg-transparent"
      onLayout={handleLayout}
    >
      <FadeOverlay position="bottom" height={80} />
      {replyingTo && (
        <ChatReplyFooter message={replyingTo} onCancel={onCancelReply} />
      )}
      <ChatInputToolbar
        {...toolbarProps}
        renderActions={() => (
          <IconButton
            icon={
              <StSvg name="paper_clip" size={24} color={colors.neutral[900]} />
            }
            onPress={onOpenAttachMenu}
          />
        )}
      />
    </View>
  );
};

export default ChatInputBar;
