import React from "react";
import { ActivityIndicator, View } from "react-native";

import { Button, Typography } from "@/src/components/ui";
import { AdditionalListSkeleton } from "@/src/components/app/menu/services/list/listSkeletons";

type AdditionalListErrorStateProps = {
  isFetching: boolean;
  onRetry: () => void;
};

export const AdditionalListLoadingState = () => {
  return <AdditionalListSkeleton />;
};

export const AdditionalListErrorState = ({
  isFetching,
  onRetry,
}: AdditionalListErrorStateProps) => {
  return (
    <View className="flex-1 items-center justify-center px-screen gap-4">
      <Typography className="text-body text-accent-red-500">
        Ошибка загрузки.
      </Typography>
      <Button
        title="Повторить"
        onPress={onRetry}
        loading={isFetching}
        disabled={isFetching}
        buttonClassName="w-full"
      />
    </View>
  );
};

type AdditionalListFooterProps = {
  isFetchingNextPage: boolean;
};

export const AdditionalListFooter = ({
  isFetchingNextPage,
}: AdditionalListFooterProps) => {
  if (!isFetchingNextPage) return null;

  return (
    <View className="gap-2">
      <View className="items-center py-2">
        <ActivityIndicator />
      </View>
    </View>
  );
};
