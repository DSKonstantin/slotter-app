import { api } from "../api";
import {
  GalleryPhoto,
  GalleryPhotosResponse,
  BulkCreateGalleryPhotosPayload,
  CreateGalleryPhotoPayload,
  UpdateGalleryPhotoPayload,
  GalleryPhotoPositionPayload,
} from "@/src/store/redux/services/api-types";

const isFormData = (data: unknown): data is FormData =>
  data instanceof FormData || Array.isArray((data as any)?._parts);

const unwrapGalleryPhoto = (response: unknown): GalleryPhoto => {
  if (response && typeof response === "object" && "gallery_photo" in response) {
    return (response as { gallery_photo: GalleryPhoto }).gallery_photo;
  }

  return response as GalleryPhoto;
};

const galleryApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getGalleryPhotos: builder.query<GalleryPhotosResponse, { userId: number }>({
      query: ({ userId }) => ({
        url: `/users/${userId}/gallery_photos`,
        method: "GET",
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.gallery_photos.map((photo) => ({
                type: "GalleryPhotos" as const,
                id: photo.id,
              })),
              { type: "GalleryPhotos" as const, id: `LIST-${arg.userId}` },
            ]
          : [{ type: "GalleryPhotos" as const, id: `LIST-${arg.userId}` }],
    }),

    bulkCreateGalleryPhotos: builder.mutation<
      GalleryPhotosResponse,
      { userId: number; data: BulkCreateGalleryPhotosPayload | FormData }
    >({
      query: ({ userId, data }) => {
        const payload = isFormData(data)
          ? data
          : buildBulkCreateFormData(data.gallery_photos);
        return {
          url: `/users/${userId}/gallery_photos/bulk_create`,
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "GalleryPhotos", id: `LIST-${arg.userId}` },
        "User",
      ],
    }),

    updateGalleryPhoto: builder.mutation<
      GalleryPhoto,
      { userId: number; id: number; data: UpdateGalleryPhotoPayload | FormData }
    >({
      query: ({ userId, id, data }) => {
        const payload = isFormData(data) ? data : { gallery_photo: data };
        return {
          url: `/users/${userId}/gallery_photos/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      transformResponse: unwrapGalleryPhoto,
      invalidatesTags: (_result, _error, arg) => [
        { type: "GalleryPhotos", id: arg.id },
        { type: "GalleryPhotos", id: `LIST-${arg.userId}` },
        "User",
      ],
    }),

    deleteGalleryPhoto: builder.mutation<void, { userId: number; id: number }>({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/gallery_photos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "GalleryPhotos", id: arg.id },
        { type: "GalleryPhotos", id: `LIST-${arg.userId}` },
        "User",
      ],
    }),

    reorderGalleryPhotos: builder.mutation<
      void,
      { userId: number; positions: GalleryPhotoPositionPayload[] }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/gallery_photos/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "GalleryPhotos", id: `LIST-${arg.userId}` },
        "User",
      ],
    }),
  }),
});

const buildBulkCreateFormData = (
  galleryPhotos: CreateGalleryPhotoPayload[],
): FormData => {
  const formData = new FormData();

  galleryPhotos.forEach((photo) => {
    formData.append("gallery_photos[][photo]", photo.photo as never);
    if (photo.position != null) {
      formData.append("gallery_photos[][position]", String(photo.position));
    }
    if (photo.crop_data != null) {
      formData.append(
        "gallery_photos[][crop_data]",
        JSON.stringify(photo.crop_data),
      );
    }
  });

  return formData;
};

export const {
  useGetGalleryPhotosQuery,
  useBulkCreateGalleryPhotosMutation,
  useUpdateGalleryPhotoMutation,
  useDeleteGalleryPhotoMutation,
  useReorderGalleryPhotosMutation,
} = galleryApi;
