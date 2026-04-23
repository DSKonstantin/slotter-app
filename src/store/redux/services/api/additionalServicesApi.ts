import { api } from "../api";
import type {
  AdditionalService,
  CreateServicePayload,
  Service,
  ServiceCategoryPositionPayload,
  UpdateServicePayload,
} from "@/src/store/redux/services/api-types";
import { PaginatedServiceCategoriesResponse } from "@/src/store/redux/services/api-types/common";
import {
  isUserIdArg,
  unwrapResponse,
  buildPositionMap,
  reorderPaginatedPages,
  applyWithRollback,
  patchMatchingCaches,
} from "./utils/cacheUtils";

type GetAdditionalServicesArg = {
  userId: number;
  params?: Record<string, string | number | boolean>;
};

const TAG = { type: "AdditionalServices" as const, id: "LIST" as const };

const additionalServicesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getAdditionalServices: builder.infiniteQuery<
      PaginatedServiceCategoriesResponse<AdditionalService>,
      GetAdditionalServicesArg,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/users/${queryArg.userId}/additional_services`,
        method: "GET",
        params: { ...queryArg.params, page: pageParam },
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          const { current_page, total_pages } = lastPage.pagination;
          return current_page < total_pages ? current_page + 1 : undefined;
        },
      },
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.additional_services.map((s) => ({
                  type: "AdditionalServices" as const,
                  id: s.id,
                })),
              ),
              TAG,
            ]
          : [TAG],
    }),

    getAdditionalService: builder.query<
      Service,
      { userId: number | string; id: number | string }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapResponse<Service>("additional_service"),
      providesTags: (_result, _error, arg) => [
        { type: "AdditionalServices", id: arg.id },
      ],
    }),

    createAdditionalService: builder.mutation<
      Service,
      { userId: number; data: CreateServicePayload | FormData }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/additional_services`,
        method: "POST",
        data: data instanceof FormData ? data : { additional_service: data },
      }),
      invalidatesTags: [TAG],
    }),

    toggleAdditionalServiceActive: builder.mutation<
      Service,
      { userId: number; id: number; is_active: boolean }
    >({
      query: ({ userId, id, is_active }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "PATCH",
        data: { additional_service: { is_active } },
      }),
      async onQueryStarted(
        { id, is_active },
        { dispatch, getState, queryFulfilled },
      ) {
        const patches = patchMatchingCaches(
          additionalServicesApi,
          getState,
          dispatch,
          TAG,
          "getAdditionalServices",
          isUserIdArg,
          (draft: {
            pages: PaginatedServiceCategoriesResponse<AdditionalService>[];
          }) => {
            for (const page of draft.pages) {
              const service = page.additional_services.find((s) => s.id === id);
              if (service) service.is_active = is_active;
            }
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    updateAdditionalService: builder.mutation<
      Service,
      {
        userId: number;
        id: number;
        data: Partial<UpdateServicePayload> | FormData;
      }
    >({
      query: ({ userId, id, data }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "PATCH",
        data: data instanceof FormData ? data : { additional_service: data },
      }),
      invalidatesTags: (_result, _error, arg) => {
        if (arg.data instanceof FormData) {
          return [{ type: "AdditionalServices", id: arg.id }, TAG];
        }
        return [];
      },
      async onQueryStarted(
        { id, data },
        { dispatch, getState, queryFulfilled },
      ) {
        if (data instanceof FormData) return;

        const patches = patchMatchingCaches(
          additionalServicesApi,
          getState,
          dispatch,
          TAG,
          "getAdditionalServices",
          isUserIdArg,
          (draft: {
            pages: PaginatedServiceCategoriesResponse<AdditionalService>[];
          }) => {
            for (const page of draft.pages) {
              const service = page.additional_services.find((s) => s.id === id);
              if (service) {
                if (data.name !== undefined) service.name = data.name;
                if (data.duration !== undefined)
                  service.duration = data.duration;
                if (data.is_active !== undefined)
                  service.is_active = data.is_active;
              }
            }
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    deleteAdditionalService: builder.mutation<
      void,
      { userId: number | string; id: number | string }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        const numericId = Number(id);

        const patches = patchMatchingCaches(
          additionalServicesApi,
          getState,
          dispatch,
          TAG,
          "getAdditionalServices",
          isUserIdArg,
          (draft: {
            pages: PaginatedServiceCategoriesResponse<AdditionalService>[];
          }) => {
            draft.pages.forEach((page) => {
              const index = page.additional_services.findIndex(
                (s) => s.id === numericId,
              );
              if (index !== -1) page.additional_services.splice(index, 1);
            });
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    reorderAdditionalServices: builder.mutation<
      void,
      { userId: number; positions: ServiceCategoryPositionPayload[] }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/additional_services/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { userId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const positionById = buildPositionMap(positions);

        const patches = patchMatchingCaches(
          additionalServicesApi,
          getState,
          dispatch,
          TAG,
          "getAdditionalServices",
          (args) => isUserIdArg(args) && args.userId === userId,
          (draft: { pages: Record<string, AdditionalService[]>[] }) => {
            reorderPaginatedPages(draft, "additional_services", positionById);
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),
  }),
});

export const {
  useGetAdditionalServicesInfiniteQuery,
  useGetAdditionalServiceQuery,
  useCreateAdditionalServiceMutation,
  useToggleAdditionalServiceActiveMutation,
  useUpdateAdditionalServiceMutation,
  useDeleteAdditionalServiceMutation,
  useReorderAdditionalServicesMutation,
} = additionalServicesApi;

export { additionalServicesApi };
