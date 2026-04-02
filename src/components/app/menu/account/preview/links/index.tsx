import React from "react";
import { View } from "react-native";
import { Divider, Item, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { User } from "@/src/store/redux/services/api-types/user";
import { formatPhoneDisplay } from "@/src/utils/mask/maskPhone";

type Props = {
  user: Pick<User, "address" | "phone" | "personal_link">;
};

const ITEM_CLASS = "rounded-none bg-transparent border-transparent";

const PreviewLinks = ({ user }: Props) => {
  const items = [
    user.address && {
      icon: <StSvg name="Pin_fill" size={24} color={colors.neutral[900]} />,
      title: user.address,
      right: (
        <StSvg
          name="Expand_right_light"
          size={20}
          color={colors.neutral[400]}
        />
      ),
      onPress: () => {},
    },
    user.phone && {
      icon: <StSvg name="Phone_fill" size={24} color={colors.neutral[900]} />,
      title: formatPhoneDisplay(user.phone),
      onPress: () => {},
    },
    user.personal_link && {
      icon: <StSvg name="glob_fill" size={24} color={colors.neutral[900]} />,
      title: user.personal_link,
      onPress: () => {},
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    title: string;
    right?: React.ReactNode;
    onPress: () => void;
  }[];

  if (!items.length) return null;

  return (
    <View className="gap-3 mx-screen">
      <Typography weight="semibold" className="text-body text-neutral-900">
        Ссылки
      </Typography>

      <View className="overflow-hidden rounded-base bg-background-surface">
        {items.map((item, index) => (
          <React.Fragment key={item.title}>
            {index > 0 && <Divider />}
            <Item
              title={item.title}
              left={item.icon}
              right={item.right}
              onPress={item.onPress}
              className={ITEM_CLASS}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

export default PreviewLinks;
