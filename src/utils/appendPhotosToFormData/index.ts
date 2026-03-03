import type {
  PhotoAsset,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";

const isLocalFile = (uri: string) => {
  return uri.startsWith("file://") || uri.startsWith("content://");
};

const getFileName = (asset: PhotoAsset, fallback: string) => {
  if ("fileName" in asset && asset.fileName) return asset.fileName;
  if ("name" in asset && asset.name) return asset.name;

  const uri = asset.uri.split("?")[0];
  const name = uri.split("/").pop();

  return name || fallback;
};

const getMimeType = (asset: PhotoAsset, fileName: string) => {
  if (asset.mimeType) return asset.mimeType;

  const ext = fileName.split(".").pop()?.toLowerCase();

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
};

const toFile = (
  asset: PhotoAsset,
  fallbackName: string,
): { uri: string; name: string; type: string } | null => {
  if (!asset.uri || !isLocalFile(asset.uri)) {
    return null;
  }

  const name = getFileName(asset, fallbackName);

  return {
    uri: asset.uri,
    name,
    type: getMimeType(asset, name),
  };
};

type Options = {
  mainKey?: string;
  additionalKeys?: [string, string, string, string];
  clearValue?: "" | "null";
};

export const appendPhotosToFormData = (
  formData: FormData,
  photos: ServicePhotosValue,
  options: Options = {},
) => {
  const {
    mainKey = "service[main_photo]",
    additionalKeys = [
      "service[additional_photo_first]",
      "service[additional_photo_second]",
      "service[additional_photo_third]",
      "service[additional_photo_fourth]",
    ],
    clearValue = "",
  } = options;

  if (photos.mainPhoto.action === "upload" && photos.mainPhoto.localAsset) {
    const file = toFile(photos.mainPhoto.localAsset, "main-photo.jpg");
    if (file) {
      formData.append(mainKey, file as any);
    }
  }

  if (photos.mainPhoto.action === "clear") {
    formData.append(mainKey, clearValue);
  }

  photos.additionalPhotos.forEach((slot, index) => {
    const key = additionalKeys[index];
    if (!key) return;

    if (slot.action === "upload" && slot.localAsset) {
      const file = toFile(slot.localAsset, `additional-photo-${index + 1}.jpg`);
      if (file) {
        formData.append(key, file as any);
      }
    }

    if (slot.action === "clear") {
      formData.append(key, clearValue);
    }
  });
};

export const hasServicePhotoChanges = (photos: ServicePhotosValue) => {
  if (photos.mainPhoto.action !== "keep") {
    return true;
  }

  return photos.additionalPhotos.some((slot) => slot.action !== "keep");
};
