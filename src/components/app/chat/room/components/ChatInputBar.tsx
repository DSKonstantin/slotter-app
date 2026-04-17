import React from "react";
import { TouchableOpacity, View } from "react-native";
import { InputToolbarProps } from "react-native-gifted-chat";
import type { ImagePickerAsset } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { StSvg } from "@/src/components/ui";
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
    <View className="px-screen bg-transparent">
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
              <View className="justify-center items-center w-10 h-10">
                <StSvg
                  name="paper_clip"
                  size={22}
                  color={colors.neutral[500]}
                />
              </View>
            </ImagePickerTrigger>

            {isUser && onAttachService && (
              <TouchableOpacity
                onPress={onAttachService}
                className="justify-center items-center w-10 h-10"
              >
                <StSvg
                  name="Add_round_light"
                  size={24}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default ChatInputBar;
