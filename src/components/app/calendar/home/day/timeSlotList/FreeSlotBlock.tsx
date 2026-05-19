import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Typography, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import InactiveDayModal from "@/src/components/shared/modals/InactiveDayModal";

type Props = {
  date?: string;
  time: string;
  endTime: string;
  isActive?: boolean;
  workingDayId?: number;
  userId?: number;
};

const FreeSlotBlock: React.FC<Props> = ({
  date,
  time,
  endTime,
  isActive = true,
  workingDayId,
  userId,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (!isActive) {
      setModalVisible(true);
      return;
    }
    router.push(Routers.app.createSlotFlow.selectService({ date, time }));
  };

  return (
    <>
      <InactiveDayModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() =>
          router.push(Routers.app.createSlotFlow.selectService({ date, time }))
        }
        workingDayId={workingDayId}
        userId={userId}
        date={date}
      />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        className="flex-1 rounded-base flex-row items-center justify-between overflow-hidden border border-neutral-200 bg-background px-4 mb-1"
      >
        <View className="gap-1a">
          <Typography className="text-body text-neutral-900">
            {time} - {endTime}
          </Typography>
          <Typography className="text-caption text-neutral-500">
            Свободное время
          </Typography>
        </View>

        <StSvg name="Add_ring_fill" size={24} color={colors.neutral[900]} />
      </TouchableOpacity>
    </>
  );
};

export default FreeSlotBlock;
