import { api } from "../api";
import type {
  CreateServiceCategoryResponse,
  CreateServiceCategoryPayload,
  PaginatedResponse,
  ServiceCategory,
  ServiceCategoryPositionPayload,
  UpdateServiceCategoryPayload,
} from "@/src/store/redux/services/api-types";
import {
  isUserIdArg,
  buildPositionMap,
  reorderPaginatedPages,
  applyWithRollback,
  patchMatchingCaches,
} from "./utils/cacheUtils";

type GetServiceCategoriesQueryArg = {
  userId: number;
  params?: Record<string, string | number | boolean>;
};

const TAG = { type: "ServiceCategories" as const, id: "LIST" as const };

const serviceCategoriesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getServiceCategories: builder.infiniteQuery<
      PaginatedResponse<ServiceCategory>,
      GetServiceCategoriesQueryArg,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/users/${queryArg.userId}/service_categories`,
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
                page.service_categories.map((c) => ({
                  type: "ServiceCategories" as const,
                  id: c.id,
                })),
              ),
              TAG,
            ]
          : [TAG],
    }),

    createServiceCategory: builder.mutation<
      CreateServiceCategoryResponse,
      { userId: number; data: CreateServiceCategoryPayload }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/service_categories`,
        method: "POST",
        data: { service_category: data },
      }),
      invalidatesTags: [TAG],
    }),

    updateServiceCategory: builder.mutation<
      ServiceCategory,
      {
        userId: number;
        id: number;
        data: Partial<UpdateServiceCategoryPayload>;
      }
    >({
      query: ({ userId, id, data }) => ({
        url: `/users/${userId}/service_categories/${id}`,
        method: "PATCH",
        data: { service_category: data },
      }),
      async onQueryStarted(
        { userId, id, data },
        { dispatch, getState, queryFulfilled },
      ) {
        const userFilter = (args: unknown) =>
          isUserIdArg(args) && args.userId === userId;

        const patches = patchMatchingCaches(
          serviceCategoriesApi,
          getState,
          dispatch,
          TAG,
          "getServiceCategories",
          userFilter,
          (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
            draft.pages.forEach((page) => {
              const category = page.service_categories.find(
                (item) => item.id === id,
              );
              if (category) Object.assign(category, data);
            });
          },
        );

        try {
          const { data: updated } = await queryFulfilled;

          patchMatchingCaches(
            serviceCategoriesApi,
            getState,
            dispatch,
            TAG,
            "getServiceCategories",
            userFilter,
            (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
              draft.pages.forEach((page) => {
                const category = page.service_categories.find(
                  (item) => item.id === id,
                );
                if (category) Object.assign(category, updated);
              });
            },
          );
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    deleteServiceCategory: builder.mutation<
      void,
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/service_categories/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { userId, id },
        { dispatch, getState, queryFulfilled },
      ) {
        const patches = patchMatchingCaches(
          serviceCategoriesApi,
          getState,
          dispatch,
          TAG,
          "getServiceCategories",
          (args) => isUserIdArg(args) && args.userId === userId,
          (draft: { pages: PaginatedResponse<ServiceCategory>[] }) => {
            draft.pages.forEach((page) => {
              const index = page.service_categories.findIndex(
                (item) => item.id === id,
              );
              if (index !== -1) page.service_categories.splice(index, 1);
            });
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    reorderServiceCategories: builder.mutation<
      void,
      { userId: number; positions: ServiceCategoryPositionPayload[] }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/service_categories/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { userId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const positionById = buildPositionMap(positions);

        const patches = patchMatchingCaches(
          serviceCategoriesApi,
          getState,
          dispatch,
          TAG,
          "getServiceCategories",
          (args) => isUserIdArg(args) && args.userId === userId,
          (draft: { pages: Record<string, ServiceCategory[]>[] }) => {
            reorderPaginatedPages(draft, "service_categories", positionById);
          },
        );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),
  }),
});

export const {
  useGetServiceCategoriesInfiniteQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useReorderServiceCategoriesMutation,
} = serviceCategoriesApi;

export { serviceCategoriesApi };
