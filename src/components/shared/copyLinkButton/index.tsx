import React, { useCallback, useRef, useState } from "react";
import { Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  link: string;
  displayLink?: string;
};

export const CopyLinkButton = ({ link, displayLink }: Props) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [link]);

  return (
    <Pressable
      onPress={handleCopy}
      className="flex-row justify-center items-center bg-background-surface w-full rounded-2xl p-4 border border-dashed border-neutral-500 gap-1.5 active:opacity-70"
    >
      <Typography className="text-body text-primary-blue-500">
        {copied ? "Скопировано" : (displayLink ?? link)}
      </Typography>
      <StSvg
        name={copied ? "Done_round" : "Copy_alt"}
        size={24}
        color={colors.primary.blue[500]}
      />
    </Pressable>
  );
};
