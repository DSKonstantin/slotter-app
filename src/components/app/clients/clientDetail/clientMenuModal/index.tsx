import React from "react";
import { View } from "react-native";
import { Item, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onChangeCategory: () => void;
};

const ClientMenuModal = ({ visible, onClose, onChangeCategory }: Props) => {
  const handleChangeCategory = () => {
    onClose();
    onChangeCategory();
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-4">
        <Typography weight="semibold" className="text-display text-center">
          Действия
        </Typography>

        <View className="gap-2">
          {/*<Item*/}
          {/*  title="Редактировать"*/}
          {/*  left={*/}
          {/*    <StSvg name="Edit_fill" size={20} color={colors.neutral[900]} />*/}
          {/*  }*/}
          {/*/>*/}
          <Item
            title="Изменить категорию"
            left={
              <StSvg name="Edit_fill" size={20} color={colors.neutral[900]} />
            }
            onPress={handleChangeCategory}
          />
        </View>
      </View>
    </StModal>
  );
};

export default ClientMenuModal;
