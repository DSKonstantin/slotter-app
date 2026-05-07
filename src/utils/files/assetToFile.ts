import type { ImagePickerAsset } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import type { UploadFile } from "@/src/types/upload";

export function assetToFile(
  asset: ImagePickerAsset | DocumentPickerAsset,
  fallback: string,
): UploadFile {
  const name =
    ("fileName" in asset && asset.fileName) ||
    ("name" in asset && asset.name) ||
    asset.uri.split("?")[0].split("/").pop() ||
    fallback;

  const type = (() => {
    if (asset.mimeType) return asset.mimeType;
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "heic":
        return "image/heic";
      default:
        return "image/jpeg";
    }
  })();

  return { uri: asset.uri, name, type };
}
