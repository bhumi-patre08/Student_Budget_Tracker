export const EXPENSE_CATEGORIES = [
  'Food',
  'Housing',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Parent Allowance',
  'Salary',
  'Freelance',
  'Business',
  'Scholarship',
  'Other',
];

const expenseMap = Object.fromEntries(
  EXPENSE_CATEGORIES.map((category) => [category.toLowerCase(), category])
);

const incomeMap = Object.fromEntries(
  INCOME_CATEGORIES.map((category) => [category.toLowerCase(), category])
);

export const normalizeExpenseCategory = (category = '') => {
  const value = String(category || '').trim();
  return expenseMap[value.toLowerCase()] || 'Other';
};

export const normalizeIncomeCategory = (category = '') => {
  const value = String(category || '').trim();
  return incomeMap[value.toLowerCase()] || 'Other';
};
