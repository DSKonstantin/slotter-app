import React from "react";
import { View } from "react-native";
import { Divider, Typography } from "@/src/components/ui";

interface InfoRowProps {
  label: string;
  right: React.ReactNode;
  divider?: boolean;
}

const InfoRow = ({ label, right, divider = true }: InfoRowProps) => (
  <>
    <View className="flex-row items-start justify-between gap-2">
      <Typography className="text-body text-neutral-500">{label}</Typography>
      {right}
    </View>
    {divider && <Divider className="my-2" />}
  </>
);

export default InfoRow;
