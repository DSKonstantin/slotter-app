import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { api } from "../api";
import type {
  CreateServicePayload,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceCategoryPositionPayload,
  UpdateServicePayload,
} from "@/src/store/redux/services/api-types";
import {
  isUserIdArg,
  unwrapResponse,
  buildPositionMap,
  applyPositionOrder,
  applyWithRollback,
  patchMatchingCaches,
} from "./utils/cacheUtils";

const CATEGORIES_TAG = {
  type: "ServiceCategories" as const,
  id: "LIST" as const,
};

const SERVICE_SYNC_KEYS = [
  "name",
  "description",
  "duration",
  "is_active",
  "is_available_online",
] as const;

type CategoriesDraft = { pages: PaginatedResponse<ServiceCategory>[] };
type Dispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

const isPublicProfileQuery = (args: unknown): boolean =>
  isUserIdArg(args) && args.params?.view === "public_profile";

const findCategoryInPages = (
  pages: PaginatedResponse<ServiceCategory>[],
  id: number,
): ServiceCategory | undefined => {
  for (const page of pages) {
    const cat = page.service_categories.find((c) => c.id === id);
    if (cat) return cat;
  }
  return undefined;
};

function patchCategoriesCache(
  getState: () => unknown,
  dispatch: Dispatch,
  mutator: (draft: CategoriesDraft) => void,
) {
  return patchMatchingCaches<"getServiceCategories", CategoriesDraft>(
    servicesApi,
    getState,
    dispatch,
    CATEGORIES_TAG,
    "getServiceCategories",
    isPublicProfileQuery,
    mutator,
  );
}

const servicesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getServices: builder.query<
      Service[],
      { categoryId: number; params?: { with_deleted?: boolean } }
    >({
      query: ({ categoryId, params }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "GET",
        params,
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.map((service) => ({
                type: "Services" as const,
                id: service.id,
              })),
              { type: "Services" as const, id: `LIST-${arg.categoryId}` },
            ]
          : [{ type: "Services" as const, id: `LIST-${arg.categoryId}` }],
    }),

    getService: builder.query<Service, { categoryId: number; id: number }>({
      query: ({ categoryId, id }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapResponse<Service>("service"),
      providesTags: (_result, _error, arg) => [
        { type: "Services", id: arg.id },
      ],
    }),

    createService: builder.mutation<
      Service,
      { categoryId: number; data: CreateServicePayload | FormData }
    >({
      query: ({ categoryId, data }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "POST",
        data: data instanceof FormData ? data : { service: data },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: `LIST-${arg.categoryId}` },
        CATEGORIES_TAG,
      ],
    }),

    updateService: builder.mutation<
      Service,
      {
        categoryId: number;
        id: number;
        data: Partial<UpdateServicePayload> | FormData;
      }
    >({
      query: ({ categoryId, id, data }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "PATCH",
        data: data instanceof FormData ? data : { service: data },
      }),
      async onQueryStarted(
        { categoryId, id, data },
        { dispatch, getState, queryFulfilled },
      ) {
        if (data instanceof FormData) return;

        if (data.service_category_id) {
          const targetCategoryId = data.service_category_id;
          const patches = patchCategoriesCache(getState, dispatch, (draft) => {
            const src = findCategoryInPages(draft.pages, categoryId);
            if (!src?.services) return;
            const idx = src.services.findIndex((s) => s.id === id);
            if (idx === -1) return;
            const [moved] = src.services.splice(idx, 1);

            const dst = findCategoryInPages(draft.pages, targetCategoryId);
            if (!dst) return;
            if (!dst.services) dst.services = [];
            dst.services.push(moved);
          });
          await applyWithRollback(patches, queryFulfilled);
          return;
        }

        const patches = patchCategoriesCache(getState, dispatch, (draft) => {
          const category = findCategoryInPages(draft.pages, categoryId);
          const service = category?.services?.find((s) => s.id === id);
          if (!service) return;
          for (const key of SERVICE_SYNC_KEYS) {
            const value = data[key];
            if (value !== undefined) {
              (service as unknown as Record<string, unknown>)[key] = value;
            }
          }
        });

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    updateServiceForm: builder.mutation<
      Service,
      {
        categoryId: number;
        id: number;
        data: Partial<UpdateServicePayload> | FormData;
      }
    >({
      query: ({ categoryId, id, data }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "PATCH",
        data: data instanceof FormData ? data : { service: data },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: `LIST-${arg.categoryId}` },
        CATEGORIES_TAG,
      ],
    }),

    deleteService: builder.mutation<void, { categoryId: number; id: number }>({
      query: ({ categoryId, id }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { categoryId, id },
        { dispatch, getState, queryFulfilled },
      ) {
        const patches = [
          dispatch(
            servicesApi.util.updateQueryData(
              "getServices",
              { categoryId },
              (draft) => {
                const index = draft.findIndex((s) => s.id === id);
                if (index !== -1) draft.splice(index, 1);
              },
            ),
          ),
          ...patchCategoriesCache(getState, dispatch, (draft) => {
            const category = findCategoryInPages(draft.pages, categoryId);
            if (!category?.services) return;

            const index = category.services.findIndex((s) => s.id === id);
            if (index === -1) return;

            const [removed] = category.services.splice(index, 1);
            if (
              removed?.is_active &&
              typeof category.activeServicesCount === "number"
            ) {
              category.activeServicesCount = Math.max(
                0,
                category.activeServicesCount - 1,
              );
            }
          }),
        ];

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    reorderServices: builder.mutation<
      void,
      { categoryId: number; positions: ServiceCategoryPositionPayload[] }
    >({
      query: ({ categoryId, positions }) => ({
        url: `/service_categories/${categoryId}/services/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { categoryId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const positionById = buildPositionMap(positions);

        const patches = [
          dispatch(
            servicesApi.util.updateQueryData(
              "getServices",
              { categoryId },
              (draft) => {
                applyPositionOrder(draft, positionById);
              },
            ),
          ),
          ...patchCategoriesCache(getState, dispatch, (draft) => {
            const category = findCategoryInPages(draft.pages, categoryId);
            if (!category?.services?.length) return;
            applyPositionOrder(category.services, positionById);
          }),
        ];

        await applyWithRollback(patches, queryFulfilled);
      },
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceFormMutation,
  useDeleteServiceMutation,
  useReorderServicesMutation,
} = servicesApi;

export { servicesApi };
