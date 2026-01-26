import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

type PickImageOptions = {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
};

export function useImagePicker() {
  const pickFromGallery = async (opts?: PickImageOptions) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: opts?.allowsEditing ?? true,
      aspect: opts?.aspect ?? [1, 1],
      quality: opts?.quality ?? 0.8,
    });

    if (res.canceled) return null;
    return res.assets[0];
  };

  const pickFromCamera = async (opts?: PickImageOptions) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: opts?.allowsEditing ?? true,
      aspect: opts?.aspect ?? [1, 1],
      quality: opts?.quality ?? 0.8,
    });

    if (res.canceled) return null;
    return res.assets[0];
  };

  const openPickerMenu = (params: {
    title?: string;
    message?: string;
    options?: PickImageOptions;
    onPick: (asset: ImagePicker.ImagePickerAsset) => void;
  }) => {
    Alert.alert(
      params.title ?? "Загрузить фото",
      params.message ?? "Выберите источник",
      [
        {
          text: "Камера",
          onPress: async () => {
            const asset = await pickFromCamera(params.options);
            if (asset) params.onPick(asset);
          },
        },
        {
          text: "Галерея",
          onPress: async () => {
            const asset = await pickFromGallery(params.options);
            if (asset) params.onPick(asset);
          },
        },
        { text: "Отмена", style: "cancel" },
      ],
    );
  };

  return {
    openPickerMenu,
    pickFromCamera,
    pickFromGallery,
  };
}
