import React from "react";
import { View } from "react-native";
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
  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-screen pb-safe bg-transparent"
    >
      <FadeOverlay position="bottom" height={80} />
      {replyingTo && (
        <View onLayout={(e) => onHeightChange(e.nativeEvent.layout.height)}>
          <ChatReplyFooter message={replyingTo} onCancel={onCancelReply} />
        </View>
      )}
      <ChatInputToolbar
        {...toolbarProps}
        renderActions={() => (
          <IconButton
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
            }}
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
