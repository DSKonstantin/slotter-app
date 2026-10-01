import React from "react";
import { StyleSheet, View, type TextProps } from "react-native";
import { AppText } from "@/src/components/ui/AppText";
import {
  LinkParser,
  type LinkType,
  type MessageTextProps,
} from "react-native-gifted-chat";
import { MAX_FONT_SCALE } from "@/src/constants/layout";
import type { ChatIMessage } from "@/src/utils/chat/types";

const CappedText = (props: TextProps) => (
  <AppText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} />
);

const ChatMessageText = ({
  currentMessage,
  position = "left",
  containerStyle,
  textStyle,
  linkStyle,
  customTextStyle,
  onPress,
  matchers,
  email = true,
  phone = true,
  url = true,
  hashtag = false,
  mention = false,
  hashtagUrl,
  mentionUrl,
  stripPrefix = false,
}: MessageTextProps<ChatIMessage>) => {
  const handlePress = (link: string, type: LinkType) =>
    onPress?.(currentMessage, link, type);

  return (
    <View style={[styles.container, containerStyle?.[position]]}>
      <LinkParser
        text={currentMessage.text}
        matchers={matchers}
        email={email}
        phone={phone}
        url={url}
        hashtag={hashtag}
        mention={mention}
        hashtagUrl={hashtagUrl}
        mentionUrl={mentionUrl}
        stripPrefix={stripPrefix}
        linkStyle={[styles.link, linkStyle?.[position]]}
        textStyle={[
          position === "right" ? styles.textRight : styles.textLeft,
          textStyle?.[position],
          customTextStyle,
        ]}
        onPress={onPress ? handlePress : undefined}
        TextComponent={CappedText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 10,
  },
  textLeft: {
    color: "black",
  },
  textRight: {
    color: "white",
  },
  link: {
    textDecorationLine: "underline",
  },
});

export default ChatMessageText;
