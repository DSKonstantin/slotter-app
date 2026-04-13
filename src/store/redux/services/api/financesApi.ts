import { api } from "../api";
import type {
  Expense,
  GetExpensesParams,
  CreateExpensePayload,
  UpdateExpensePayload,
  FinancesSummary,
  FinancesIncome,
} from "@/src/store/redux/services/api-types";

const financesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
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
      invalidatesTags: ["FinancesSummary"],
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
      invalidatesTags: ["FinancesSummary"],
    }),

    deleteExpense: builder.mutation<void, { expenseId: number }>({
      query: ({ expenseId }) => ({
        url: `/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FinancesSummary"],
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
      providesTags: ["FinancesSummary"],
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
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetFinancesSummaryQuery,
  useGetFinancesIncomeQuery,
} = financesApi;
