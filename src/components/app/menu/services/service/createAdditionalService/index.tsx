import React from "react";
import { Card, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { ScrollView, View } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import CreateAdditionalServiceModal from "@/src/components/app/menu/services/service/createAdditionalService/createAdditionalServiceModal";

const CreateAdditionalService = () => {
  const { control } = useFormContext();

  const { fields: additionalServices, remove } = useFieldArray({
    control,
    name: "additionalServices",
  });

  return (
    <>
      <Typography className="text-caption text-neutral-500 mt-5 mb-2 px-screen">
        Дополнительные услуги
      </Typography>

      <ScrollView
        className="mb-2"
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-2 py-1">
          {additionalServices.map((service, index) => (
            <View key={service.id} className="relative">
              <Card
                title={service.title}
                subtitle={`${service.duration} мин | ${service.price} ₽`}
                right={
                  <StSvg
                    name="Edit_light"
                    size={24}
                    color={colors.neutral[500]}
                  />
                }
              />

              <IconButton
                onPress={() => remove(index)}
                size="xs"
                buttonClassName="absolute -top-2 -right-2 bg-background rounded-full"
                icon={
                  <StSvg
                    name="Close_round_fill_light"
                    size={18}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <CreateAdditionalServiceModal />
    </>
  );
};

export default CreateAdditionalService;
