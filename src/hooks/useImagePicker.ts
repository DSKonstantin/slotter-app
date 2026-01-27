import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export type PickedFile = {
  uri: string;
  name?: string | null | undefined;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
};

type PickImageOptions = {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
};

export function useImagePicker() {
  const pickFromGallery = async (
    opts?: PickImageOptions,
  ): Promise<PickedFile | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return null;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: opts?.allowsEditing ?? true,
      aspect: opts?.aspect ?? [1, 1],
      quality: opts?.quality ?? 0.8,
      // allowsMultipleSelection: opts?.allowsMultipleSelection ?? false,
    });

    if (res.canceled) return null;

    const asset = res.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName,
      mimeType: asset.mimeType,
      size: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  };

  const pickFromCamera = async (
    opts?: PickImageOptions,
  ): Promise<PickedFile | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: opts?.allowsEditing ?? true,
      aspect: opts?.aspect ?? [1, 1],
      quality: opts?.quality ?? 0.8,
    });

    if (res.canceled) return null;

    const asset = res.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName,
      mimeType: asset.mimeType,
      size: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  };

  const pickFromFiles = async (): Promise<PickedFile | null> => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.canceled) return null;

    const asset = res.assets?.[0];
    if (!asset) return null;

    return {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    };
  };

  const openPickerMenu = (params: {
    title?: string;
    message?: string;
    options?: PickImageOptions;
    includeFiles?: boolean;
    onPick: (asset: PickedFile) => void;
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
        {
          text: "Файлы",
          onPress: async () => {
            const asset = await pickFromFiles();
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
    pickFromFiles,
  };
}
