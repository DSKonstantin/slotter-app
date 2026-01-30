import type { ImagePickerAsset, ImagePickerOptions } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export function useImagePicker() {
  const pickFromGallery = async (
    opts?: ImagePickerOptions,
  ): Promise<ImagePickerAsset[] | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Требуется разрешение\n Для доступа к медиатеке требуется разрешение.",
      );
      return null;
    }
    const multiple = opts?.allowsMultipleSelection ?? false;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      ...opts,

      allowsEditing: multiple ? false : (opts?.allowsEditing ?? true),
      allowsMultipleSelection: multiple,
    });

    if (res.canceled) return null;

    return res.assets;
  };

  const pickFromCamera = async (
    opts?: ImagePickerOptions,
  ): Promise<ImagePickerAsset[] | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: opts?.allowsEditing ?? true,
      aspect: opts?.aspect ?? [1, 1],
      quality: opts?.quality ?? 1,
    });

    if (res.canceled) return null;

    return res.assets;
  };

  const pickFromFiles = async (
    opts?: ImagePickerOptions,
  ): Promise<DocumentPickerAsset[] | null> => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      copyToCacheDirectory: true,
      multiple: opts?.allowsMultipleSelection ?? false,
    });

    if (res.canceled) return null;
    return res.assets;
  };

  return {
    pickFromCamera,
    pickFromGallery,
    pickFromFiles,
  };
}
