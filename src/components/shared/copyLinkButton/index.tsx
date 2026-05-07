import React, { useCallback, useRef, useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import * as Clipboard from "expo-clipboard";
import { twMerge } from "tailwind-merge";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  link: string;
  displayLink?: string;
  className?: string;
  textClassName?: string;
  iconColor?: string;
  iconSize?: number;
  pressableProps?: Omit<PressableProps, "onPress" | "className">;
};

export const CopyLinkButton = ({
  link,
  displayLink,
  className,
  textClassName,
  iconColor = colors.primary.blue[500],
  iconSize = 24,
  pressableProps,
}: Props) => {
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
      {...pressableProps}
      onPress={handleCopy}
      className={twMerge(
        "flex-row justify-center items-center bg-background-surface w-full rounded-2xl p-4 border border-dashed border-neutral-500 gap-1.5 active:opacity-70",
        className,
      )}
    >
      <Typography
        weight="semibold"
        className={twMerge("text-body text-primary-blue-500", textClassName)}
      >
        {copied ? "Скопировано" : (displayLink ?? link)}
      </Typography>
      <StSvg
        name={copied ? "Done_round" : "Copy_alt"}
        size={iconSize}
        color={iconColor}
      />
    </Pressable>
  );
};
