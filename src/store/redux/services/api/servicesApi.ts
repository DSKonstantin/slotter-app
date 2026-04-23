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
      invalidatesTags: (_result, _error, arg) => {
        if (
          arg.data instanceof FormData ||
          (!(arg.data instanceof FormData) && arg.data.service_category_id)
        ) {
          return [
            { type: "Services", id: `LIST-${arg.categoryId}` },
            CATEGORIES_TAG,
          ];
        }
        return [];
      },
      async onQueryStarted(
        { categoryId, id, data },
        { dispatch, getState, queryFulfilled },
      ) {
        if (data instanceof FormData) return;
        if (data.service_category_id) return;

        const patches = patchMatchingCaches(
          servicesApi,
          getState,
          dispatch,
          CATEGORIES_TAG,
          "getServiceCategories",
          (args) => isUserIdArg(args),
          (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
            for (const page of draft.pages) {
              const category = page.service_categories.find(
                (c) => c.id === categoryId,
              );
              if (!category?.services) continue;
              const service = category.services.find((s) => s.id === id);
              if (service) {
                if (data.name !== undefined) service.name = data.name;
                if (data.description !== undefined)
                  service.description = data.description;
                if (data.duration !== undefined)
                  service.duration = data.duration;
                if (data.is_active !== undefined)
                  service.is_active = data.is_active;
                if (data.is_available_online !== undefined)
                  service.is_available_online = data.is_available_online;
              }
            }
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
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
          ...patchMatchingCaches(
            servicesApi,
            getState,
            dispatch,
            CATEGORIES_TAG,
            "getServiceCategories",
            (args) =>
              isUserIdArg(args) && args.params?.view === "public_profile",
            (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
              draft.pages.forEach((page) => {
                const category = page.service_categories.find(
                  (item) => item.id === categoryId,
                );
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
              });
            },
          ),
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
          ...patchMatchingCaches(
            servicesApi,
            getState,
            dispatch,
            CATEGORIES_TAG,
            "getServiceCategories",
            (args) =>
              isUserIdArg(args) && args.params?.view === "public_profile",
            (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
              draft.pages.forEach((page) => {
                const category = page.service_categories.find(
                  (item) => item.id === categoryId,
                );
                if (!category?.services?.length) return;
                applyPositionOrder(category.services, positionById);
              });
            },
          ),
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
  useDeleteServiceMutation,
  useReorderServicesMutation,
} = servicesApi;

export { servicesApi };
