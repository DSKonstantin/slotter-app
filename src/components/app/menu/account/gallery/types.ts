export type PendingPhoto = {
  uri: string;
  mimeType: string;
  fileName: string;
  cropData: CropData | null;
  croppedUri: string | null;
};

export type GalleryPhoto = {
  id: string;
  originalUrl: string;
  photoUrl: string;
  croppedUrl: string | null;
  thumbnailUrl: string;
  cropData: CropData | null;
  isCover: boolean;
};

/** All values are in pixels */
export type CropData = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};
