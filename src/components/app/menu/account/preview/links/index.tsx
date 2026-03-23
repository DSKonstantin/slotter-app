import React from "react";
import { View, Text, Pressable } from "react-native";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";

type PreviewLinksProps = {
  links: string[];
};

const PreviewLinks = ({ links }: PreviewLinksProps) => {
  if (!links.length) return null;

  return (
    <View className="gap-2">
      {links.map((url, index) => (
        <View key={index} className="flex-row items-center gap-3">
          <StSvg name="glob_fill" size={20} color={colors.neutral[500]} />
          <Text
            className="font-inter-regular text-body text-primary-blue-500 flex-1"
            numberOfLines={1}
          >
            {url}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default PreviewLinks;
