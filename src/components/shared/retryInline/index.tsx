import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  text?: string;
  buttonText?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  layout?: "row" | "column";
  className?: string;
};

const RetryInline = ({
  text = "Не удалось загрузить",
  buttonText = "Обновить",
  onRetry,
  isLoading = false,
  layout = "row",
  className,
}: Props) => {
  const isRow = layout === "row";

  return (
    <View
      className={twMerge(
        isRow ? "flex-row items-center gap-2" : "items-center gap-2",
        className,
      )}
    >
      <Typography
        className={twMerge(
          "text-body text-neutral-500",
          isRow ? "flex-1" : "text-center",
        )}
      >
        {text}
      </Typography>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          disabled={isLoading}
          hitSlop={8}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary.blue[500]} />
          ) : (
            <StSvg
              name="Refresh_2"
              size={16}
              color={colors.primary.blue[500]}
            />
          )}
          <Typography className="text-body text-primary-blue-500">
            {buttonText}
          </Typography>
        </Pressable>
      )}
    </View>
  );
};

export default RetryInline;
