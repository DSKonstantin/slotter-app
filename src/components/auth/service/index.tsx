import React, { useState } from "react";
import * as Yup from "yup";
import { Image } from "expo-image";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { HOURS_OPTIONS } from "@/src/constants/hoursOptions";
import { PickedFile } from "@/src/hooks/useImagePicker";
import { ServiceImagesPicker } from "@/src/components/auth/service/ServiceImagesPicker";

type ServiceFormValues = {};

const Service = () => {
  const [images, setImages] = useState<PickedFile[]>([]);
  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {},
  });

  const onSubmit = (data: ServiceFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.schedule);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Сохранить",
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              onPress: () => {
                router.push(Routers.auth.schedule);
              },
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={2} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Первая услуга
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Добавь самую популярную
          </Typography>
          <View className="gap-2 mt-9">
            <RhfTextField name="name" label="Название" placeholder="Стрижка" />
          </View>
        </View>
        <View className="flex-row mt-3 gap-3">
          <View className="flex-1">
            <RhfTextField
              name="price"
              label="Цена"
              placeholder="1 500 ₽"
              keyboardType="phone-pad"
            />
          </View>
          <View className="flex-1">
            <RHFSelect
              name="fruit"
              label="Время"
              placeholder="1 час"
              items={HOURS_OPTIONS as any}
            />
          </View>
        </View>

        <View className="gap-2">
          {/*<Typography weight="medium" className="text-caption text-gray">*/}
          {/*  Фото услуги (необязательно)*/}
          {/*</Typography>*/}

          <ServiceImagesPicker value={images} onChange={setImages} max={10} />

          {/*<ImagePickerTrigger*/}
          {/*  title="Загрузить фото"*/}
          {/*  onPick={(assets) => {*/}
          {/*    setImages((prev) => [...prev, assets]);*/}
          {/*  }}*/}
          {/*  options={{ aspect: [1, 1] }}*/}
          {/*>*/}
          {/*  <View className="p-2 border justify-center items-center border-gray rounded-3xl border-dashed gap-1 h-[116px]">*/}
          {/*    {images.length === 0 ? (*/}
          {/*      <>*/}
          {/*        <StSvg name="layers" size={40} color="black" />*/}
          {/*        <Typography weight="medium" className="text-body">*/}
          {/*          Добавить фото*/}
          {/*        </Typography>*/}
          {/*      </>*/}
          {/*    ) : (*/}
          {/*      <View className="flex-row items-center">*/}
          {/*        <View style={{ width: 120, height: 72 }}>*/}
          {/*          {images*/}
          {/*            .slice(0, 4)*/}
          {/*            .reverse()*/}
          {/*            .map((img, i) => {*/}
          {/*              const offset = i * 10;*/}
          {/*              const isTop = i === 4 - 1;*/}

          {/*              return (*/}
          {/*                <View*/}
          {/*                  key={img.uri}*/}
          {/*                  style={{*/}
          {/*                    position: "absolute",*/}
          {/*                    left: offset,*/}
          {/*                    top: offset - 15,*/}
          {/*                    width: 72,*/}
          {/*                    height: 72,*/}
          {/*                    borderRadius: 16,*/}
          {/*                    overflow: "hidden",*/}
          {/*                    borderWidth: 1,*/}
          {/*                    borderColor: "#fff",*/}
          {/*                  }}*/}
          {/*                >*/}
          {/*                  <Image*/}
          {/*                    source={{ uri: img.uri }}*/}
          {/*                    style={{ width: "100%", height: "100%" }}*/}
          {/*                  />*/}

          {/*                  {4 > 0 && isTop && (*/}
          {/*                    <View*/}
          {/*                      style={{*/}
          {/*                        position: "absolute",*/}
          {/*                        inset: 0,*/}
          {/*                        backgroundColor: "rgba(0,0,0,0.45)",*/}
          {/*                        alignItems: "center",*/}
          {/*                        justifyContent: "center",*/}
          {/*                      }}*/}
          {/*                    >*/}
          {/*                      <Typography*/}
          {/*                        className="text-white text-body"*/}
          {/*                        weight="semibold"*/}
          {/*                      >*/}
          {/*                        +{images.length - 4}*/}
          {/*                      </Typography>*/}
          {/*                    </View>*/}
          {/*                  )}*/}
          {/*                </View>*/}
          {/*              );*/}
          {/*            })}*/}
          {/*        </View>*/}

          {/*        <Typography className="ml-2 text-caption text-gray">*/}
          {/*          {images.length} фото*/}
          {/*        </Typography>*/}
          {/*      </View>*/}
          {/*    )}*/}
          {/*  </View>*/}
          {/*</ImagePickerTrigger>*/}

          {/*<Typography weight="medium" className="text-caption text-gray">*/}
          {/*  Постарайся выбрать крутые фотки, с ними клиентов будет больше*/}
          {/*</Typography>*/}
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Service;
