import React from "react";
import { Card, IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { ScrollView, View } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ServiceFormValues } from "@/src/components/app/menu/services/service/serviceForm";
import CreateAdditionalServiceModal from "@/src/components/app/menu/services/service/createAdditionalService/createAdditionalServiceModal";

const CreateAdditionalService = () => {
  const { control } = useFormContext<ServiceFormValues>();

  const { fields: additionalServices, remove } = useFieldArray({
    control,
    name: "additionalServices",
  });

  return (
    <>
      <ScrollView
        className="mb-2"
        horizontal
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
