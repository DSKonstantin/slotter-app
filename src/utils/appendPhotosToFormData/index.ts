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
  additionalKey?: string;
};

export const appendPhotosToFormData = (
  formData: FormData,
  photos: ServicePhotosValue,
  options: Options = {},
) => {
  const {
    mainKey = "service[main_photo]",
    additionalKey = "service[additional_photos][]",
  } = options;

  const main = photos.titlePhoto.assets[0];

  if (main) {
    const file = toFile(main, "main-photo.jpg");

    if (file) {
      formData.append(mainKey, file as any);
    }
  }

  photos.otherPhoto.assets.forEach((asset, index) => {
    const file = toFile(asset, `additional-photo-${index + 1}.jpg`);

    if (file) {
      formData.append(additionalKey, file as any);
    }
  });
};
