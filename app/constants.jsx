export const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', color: 'rgb(239, 68, 68)' },
  { id: 'transport', name: 'Transportation', color: 'rgb(59, 130, 246)' },
  { id: 'utilities', name: 'Utilities', color: 'rgb(16, 185, 129)' },
  { id: 'entertainment', name: 'Entertainment', color: 'rgb(245, 158, 11)' },
  { id: 'shopping', name: 'Shopping', color: 'rgb(139, 92, 246)' },
  { id: 'health', name: 'Healthcare', color: 'rgb(236, 72, 153)' },
  { id: 'other', name: 'Other', color: 'rgb(107, 114, 128)' }
];

export const DEFAULT_BUDGETS = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = 0;
  return acc;
}, {});