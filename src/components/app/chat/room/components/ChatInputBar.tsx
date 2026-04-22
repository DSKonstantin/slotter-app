import React from "react";
import { View } from "react-native";
import { InputToolbarProps } from "react-native-gifted-chat";
import type { ImagePickerAsset } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { FadeOverlay, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ImagePickerTrigger from "@/src/components/shared/imagePicker/imagePickerTrigger";
import type { ChatIMessage } from "@/src/utils/chat/types";
import ChatInputToolbar from "./ChatInputToolbar";
import ChatReplyFooter from "./ChatReplyFooter";

type Props = InputToolbarProps<ChatIMessage> & {
  replyingTo: ChatIMessage | null;
  onCancelReply: () => void;
  onAttach: (assets: ImagePickerAsset[] | DocumentPickerAsset[]) => void;
  isUser?: boolean;
  onAttachService?: () => void;
};

const ChatInputBar = ({
  replyingTo,
  onCancelReply,
  onAttach,
  isUser,
  onAttachService,
  ...toolbarProps
}: Props) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 px-screen pb-safe bg-transparent">
      <FadeOverlay position="bottom" height={80} />
      {replyingTo && (
        <ChatReplyFooter message={replyingTo} onCancel={onCancelReply} />
      )}
      <ChatInputToolbar
        {...toolbarProps}
        renderActions={() => (
          <View className="flex-row items-center">
            <ImagePickerTrigger
              title="Прикрепить файл"
              message="Выберите источник"
              includeFiles
              options={{ allowsMultipleSelection: true, selectionLimit: 10 }}
              onPick={onAttach}
            >
              <View className="justify-center items-center w-[48px] h-[48px] bg-background-surface rounded-full mr-1">
                <StSvg
                  name="paper_clip"
                  size={24}
                  color={colors.neutral[900]}
                />
              </View>
            </ImagePickerTrigger>

            {isUser && onAttachService && (
              <IconButton
                icon={
                  <StSvg
                    name="Meatballs_menu"
                    size={24}
                    color={colors.neutral[900]}
                  />
                }
                onPress={onAttachService}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ChatInputBar;
