export type GalleryPhoto = {
  id: string;
  originalUri: string;
  croppedUri: string | null;
  cropData: CropData | null;
  isCover: boolean;
};

export type CropData = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};
