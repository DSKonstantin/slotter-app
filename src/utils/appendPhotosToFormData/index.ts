import type { ServicePhotosValue } from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { assetToFile } from "@/src/utils/files/assetToFile";

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
    formData.append(
      mainKey,
      assetToFile(photos.mainPhoto.localAsset, "main-photo.jpg") as any,
    );
  }

  if (photos.mainPhoto.action === "clear") {
    formData.append(mainKey, clearValue);
  }

  photos.additionalPhotos.forEach((slot, index) => {
    const key = additionalKeys[index];
    if (!key) return;

    if (slot.action === "upload" && slot.localAsset) {
      formData.append(
        key,
        assetToFile(
          slot.localAsset,
          `additional-photo-${index + 1}.jpg`,
        ) as any,
      );
    }

    if (slot.action === "clear") {
      formData.append(key, clearValue);
    }
  });
};
