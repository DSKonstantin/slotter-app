export type GalleryPhoto = {
  id: string;
  originalUri: string;
  width: number;
  height: number;
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
