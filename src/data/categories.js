// Canonical category + account catalogs. Stored custom lists extend these.

export const OPENING_BALANCE_CENTS = 0; // Start from zero — balance is the sum of all entries

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Housing",
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Healthcare",
  "Utilities",
  "Entertainment",
  "Education",
  "Travel",
  "Personal Care",
  "Subscriptions",
  "Other",
];

export const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Gifts",
  "Other Income",
];

export const DEFAULT_ACCOUNTS = [
  "Cash",
  "HDFC ••4821",
  "SBI ••1005",
  "UPI",
];

// Legacy short lists (kept for compat with older seed data)
export const EXPENSE_CATEGORIES = [
  "Housing",
  "Groceries",
  "Dining",
  "Transit",
  "Utilities",
  "Subscriptions",
  "Other",
];
export const INCOME_CATEGORIES = ["Income"];
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
export const OPENING_BALANCE = 10509.13;

export const DEFAULT_BUDGETS = [
  { category: "Housing", limit: 25000 },
  { category: "Food & Dining", limit: 12000 },
  { category: "Transportation", limit: 5000 },
  { category: "Shopping", limit: 8000 },
  { category: "Utilities", limit: 4000 },
  { category: "Entertainment", limit: 4000 },
];
