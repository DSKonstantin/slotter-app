export interface ExpenseCategory {
  id: number;
  name: string;
  position: number;
}

export interface Expense {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  is_recurring: boolean;
  expense_category: ExpenseCategory | null;
}

export type GetExpensesParams = {
  date_from?: string;
  date_to?: string;
  expense_category_id?: number;
  is_recurring?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateExpenseCategoryPayload = {
  name: string;
};

export type UpdateExpenseCategoryPayload =
  Partial<CreateExpenseCategoryPayload>;

export type CreateExpensePayload = {
  amount: number;
  description?: string;
  date: string;
  is_recurring?: boolean;
  expense_category_id?: number;
};

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseCategoryBreakdown {
  category_name: string;
  amount: number;
}

export interface FinancesSummary {
  income: number;
  appointments_count: number;
  average_check: number;
  income_growth_percent: number | null;
  expenses: number;
  net_profit: number;
  expenses_by_category: ExpenseCategoryBreakdown[];
}

export interface FinancesIncomePoint {
  period: string;
  amount: number;
}

export interface FinancesIncomeItem {
  name: string;
  amount: number;
  appointments_count?: number;
}

export interface FinancesIncome {
  total: number;
  new_clients_percent: number;
  chart: FinancesIncomePoint[];
  breakdown: FinancesIncomeItem[];
}
