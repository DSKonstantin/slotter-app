export type PendingPhoto = {
  uri: string;
  mimeType: string;
  fileName: string;
  cropData: CropData | null;
};

export type GalleryPhoto = {
  id: string;
  originalUrl: string;
  photoUrl: string;
  thumbnailUrl: string;
  cropData: CropData | null;
  isCover: boolean;
};

/** All values are relative (0–1), not pixels */
export type CropData = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};
