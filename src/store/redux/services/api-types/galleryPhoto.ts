/** All values are relative (0–1), not pixels */
export interface GalleryPhotoCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GalleryPhoto {
  id: number;
  position: number;
  crop_data: GalleryPhotoCropData | null;
  thumbnail_url: string;
  photo_url: string;
  blurhash: string | null;
}

export interface GalleryPhotosResponse {
  gallery_photos: GalleryPhoto[];
}

export type CreateGalleryPhotoPayload = {
  photo: File | Blob;
  position?: number;
  crop_data?: GalleryPhotoCropData | null;
};

export type BulkCreateGalleryPhotosPayload = {
  gallery_photos: CreateGalleryPhotoPayload[];
};

export type UpdateGalleryPhotoPayload = Partial<{
  position: number;
  crop_data: GalleryPhotoCropData | null;
}>;

export type GalleryPhotoPositionPayload = {
  id: number;
  position: number;
};
