import React from "react";
import { Linking, View } from "react-native";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const MOCK_CALL_NUMBER = "88005553535";
const MOCK_CALL_NUMBER_DISPLAY = "8 800 555 35 35";

type CallModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const CallModal = ({ visible, onClose }: CallModalProps) => {
  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="px-4 pt-2 pb-4">
        <View className="bg-neutral-100 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-1">
            <Typography className="text-center text-caption text-neutral-500">
              Позвонить на номер
            </Typography>
            <View className="flex-row items-center bg-primary-green-500 rounded-full px-3 py-1 gap-1">
              <Typography className="text-caption text-primary-green-700 font-medium">
                Бесплатно
              </Typography>
              <StSvg
                name="Done_round"
                size={16}
                color={colors.primary.green[700]}
              />
            </View>
          </View>
          <Typography weight="semibold" className="text-title">
            {MOCK_CALL_NUMBER_DISPLAY}
          </Typography>
        </View>

        <Button
          title="Позвонить"
          onPress={() => Linking.openURL(`tel:${MOCK_CALL_NUMBER}`)}
          rightIcon={<StSvg name="Phone_fill" size={19} color="white" />}
        />
      </View>
    </StModal>
  );
};
