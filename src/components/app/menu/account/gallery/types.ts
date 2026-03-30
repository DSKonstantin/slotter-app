export type GalleryPhoto = {
  id: string;
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
