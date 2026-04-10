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
  amount_cents: number;
}

export interface FinancesSummary {
  income_cents: number;
  appointments_count: number;
  average_check_cents: number;
  growth_percent: number | null;
  total_expenses_cents: number;
  recurring_expenses_cents: number;
  net_profit_cents: number;
  expenses: ExpenseCategoryBreakdown[];
  currency: string;
}

export interface FinancesIncomePoint {
  month: string;
  amount_cents: number;
}

export interface FinancesIncomeItem {
  service_id?: number;
  customer_id?: number;
  name: string;
  total_cents: number;
  appointments_count?: number;
  is_new?: boolean;
}

export interface FinancesIncome {
  total_cents: number;
  new_clients_percent: number;
  chart: FinancesIncomePoint[];
  breakdown: FinancesIncomeItem[];
  currency: string;
}
