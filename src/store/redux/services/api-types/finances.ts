export interface Expense {
  id: number;
  name: string;
  amount: number;
  comment: string | null;
  date: string;
  is_recurring: boolean;
}

export type GetExpensesParams = {
  date_from?: string;
  date_to?: string;
  is_recurring?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateExpensePayload = {
  name: string;
  amount: number;
  date: string;
  is_recurring?: boolean;
  comment?: string;
};

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface SummaryExpense {
  id: number;
  name: string;
  amount_cents: number;
  amount_currency: string;
  comment: string | null;
  date: string;
  is_recurring: boolean;
}

export interface FinancesSummary {
  income_cents: number;
  appointments_count: number;
  average_check_cents: number;
  growth_percent: number | null;
  total_expenses_cents: number;
  recurring_expenses_cents: number;
  net_profit_cents: number;
  expenses: SummaryExpense[];
  currency: string;
}

export interface FinancesIncomePoint {
  month: string;
  amount_cents: number;
}

export interface FinancesIncomeItemTag {
  id: number;
  name: string;
  color: string;
}

export interface FinancesIncomeItem {
  service_id?: number;
  customer_id?: number;
  name: string;
  total_cents: number;
  appointments_count?: number;
  is_new?: boolean;
  tag?: FinancesIncomeItemTag | null;
  sales_count?: number;
}

export interface FinancesIncome {
  total_cents: number;
  new_clients_percent: number;
  chart: FinancesIncomePoint[];
  breakdown: FinancesIncomeItem[];
  currency: string;
}
