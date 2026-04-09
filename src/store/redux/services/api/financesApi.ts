import { api } from "../api";
import type {
  ExpenseCategory,
  Expense,
  GetExpensesParams,
  CreateExpenseCategoryPayload,
  UpdateExpenseCategoryPayload,
  CreateExpensePayload,
  UpdateExpensePayload,
  FinancesSummary,
  FinancesIncome,
} from "@/src/store/redux/services/api-types";

const financesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getExpenseCategories: builder.query<
      { expense_categories: ExpenseCategory[] },
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/expense_categories`,
        method: "GET",
      }),
      providesTags: ["ExpenseCategories"],
    }),

    createExpenseCategory: builder.mutation<
      { expense_category: ExpenseCategory },
      { userId: number; body: CreateExpenseCategoryPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/expense_categories`,
        method: "POST",
        data: { expense_category: body },
      }),
      invalidatesTags: ["ExpenseCategories"],
    }),

    updateExpenseCategory: builder.mutation<
      { expense_category: ExpenseCategory },
      { categoryId: number; body: UpdateExpenseCategoryPayload }
    >({
      query: ({ categoryId, body }) => ({
        url: `/expense_categories/${categoryId}`,
        method: "PATCH",
        data: { expense_category: body },
      }),
      invalidatesTags: ["ExpenseCategories"],
    }),

    deleteExpenseCategory: builder.mutation<void, { categoryId: number }>({
      query: ({ categoryId }) => ({
        url: `/expense_categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpenseCategories"],
    }),

    // Expenses
    getExpenses: builder.query<
      { expenses: Expense[] },
      { userId: number } & GetExpensesParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/users/${userId}/expenses`,
        method: "GET",
        params,
      }),
      providesTags: ["Expenses"],
    }),

    createExpense: builder.mutation<
      { expense: Expense },
      { userId: number; body: CreateExpensePayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/expenses`,
        method: "POST",
        data: { expense: body },
      }),
      invalidatesTags: ["Expenses"],
    }),

    updateExpense: builder.mutation<
      { expense: Expense },
      { expenseId: number; body: UpdateExpensePayload }
    >({
      query: ({ expenseId, body }) => ({
        url: `/expenses/${expenseId}`,
        method: "PATCH",
        data: { expense: body },
      }),
      invalidatesTags: ["Expenses"],
    }),

    deleteExpense: builder.mutation<void, { expenseId: number }>({
      query: ({ expenseId }) => ({
        url: `/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
    }),

    // Analytics
    getFinancesSummary: builder.query<
      FinancesSummary,
      { userId: number; month: number; year: number }
    >({
      query: ({ userId, month, year }) => ({
        url: `/users/${userId}/finances/summary`,
        method: "GET",
        params: { month, year },
      }),
    }),

    getFinancesIncome: builder.query<
      FinancesIncome,
      {
        userId: number;
        date_from: string;
        date_to: string;
        group_by?: "clients" | "services";
      }
    >({
      query: ({ userId, ...params }) => ({
        url: `/users/${userId}/finances/income`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetFinancesSummaryQuery,
  useGetFinancesIncomeQuery,
} = financesApi;
