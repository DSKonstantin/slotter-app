import React from "react";
import { View } from "react-native";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountLinksSchema,
  type AccountLinksFormValues,
} from "@/src/validation/schemas/accountLinks.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, IconButton, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

const Links = () => {
  const methods = useForm<AccountLinksFormValues>({
    resolver: yupResolver(AccountLinksSchema),
    defaultValues: {
      links: [{ url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "links",
  });

  const watchedLinks = methods.watch("links");

  useFormNavigationGuard(methods.formState.isDirty);

  const onSubmit = (data: AccountLinksFormValues) => {
    // TODO: save links
  };

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Ссылки">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              bottomOffset={BOTTOM_OFFSET_SMALL}
              contentContainerStyle={{
                paddingTop: topInset + 16,
                paddingBottom: 16,
              }}
            >
              <View className="px-screen gap-1">
                {fields.map((field, index) => (
                  <View key={field.id}>
                    <RhfTextField
                      label={`Ссылка №${index + 1}`}
                      name={`links.${index}.url`}
                      placeholder="https://"
                      autoCapitalize="none"
                      keyboardType="url"
                      startAdornment={
                        <StSvg
                          name="glob_fill"
                          size={24}
                          color={colors.neutral[900]}
                        />
                      }
                      endAdornment={
                        watchedLinks[index]?.url ? (
                          <IconButton
                            size="xs"
                            onPress={() =>
                              fields.length > 1
                                ? remove(index)
                                : methods.setValue(`links.${index}.url`, "")
                            }
                            icon={
                              <StSvg
                                name="close_ring_fill_light"
                                size={24}
                                color={colors.neutral[400]}
                              />
                            }
                          />
                        ) : null
                      }
                    />
                  </View>
                ))}

                <Button
                  variant="clear"
                  title="Добавить"
                  onPress={() => append({ url: "" })}
                  rightIcon={
                    <StSvg
                      name="Add_ring_fill"
                      size={22}
                      color={colors.neutral[900]}
                    />
                  }
                />
              </View>
            </KeyboardAwareScrollView>

            <View
              className="px-screen"
              style={{ paddingBottom: bottomInset + 16 }}
            >
              <Button
                title="Сохранить изменения"
                onPress={methods.handleSubmit(onSubmit)}
                rightIcon={
                  <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
                }
              />
            </View>
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default Links;
