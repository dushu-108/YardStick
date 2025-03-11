'use client';

import { CATEGORIES } from '../constants';

export default function SpendingInsights({ transactions, budgets }) {
  // Debug the incoming data
  console.log('SpendingInsights - Transactions received:', transactions);
  console.log('SpendingInsights - Budgets received:', budgets);

  // Fix: Normalize category values with better matching logic
  const categoryTotals = transactions.reduce((acc, t) => {
    // Find matching category by checking both ID and name with improved matching
    const categoryId = findCategoryId(t.category);
    console.log(`Transaction ${t._id}: Category "${t.category}" mapped to "${categoryId}"`);
    
    if (categoryId) {
      acc[categoryId] = (acc[categoryId] || 0) + t.amount;
    }
    return acc;
  }, {});

  console.log('SpendingInsights - Category totals:', categoryTotals);

  // Improved helper function to find category ID from category string
  function findCategoryId(categoryString) {
    if (!categoryString) return 'other'; // Default to other if category is missing
    
    // First, check if it's already a valid ID
    if (CATEGORIES.some(cat => cat.id === categoryString)) {
      return categoryString;
    }
    
    // Next, try to find a category whose name contains the categoryString
    // This is more flexible than exact matching
    const matchedCategory = CATEGORIES.find(cat => 
      cat.name.toLowerCase().includes(categoryString.toLowerCase()) ||
      categoryString.toLowerCase().includes(cat.id.toLowerCase())
    );
    
    // If no match, log it and return 'other'
    if (!matchedCategory) {
      console.log(`Could not map category "${categoryString}" to any known category, defaulting to "other"`);
      return 'other';
    }
    
    return matchedCategory.id;
  }

  const insights = CATEGORIES.map(cat => {
    const spent = categoryTotals[cat.id] || 0;
    const budget = budgets[cat.id] || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    return {
      category: cat.name,
      categoryId: cat.id,
      spent,
      budget,
      percentage,
      status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good',
    };
  }).filter(insight => insight.budget > 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getMessage = (insight) => {
    if (insight.status === 'over') {
      return `Over budget by $${(insight.spent - insight.budget).toFixed(2)}`;
    }
    if (insight.status === 'warning') {
      return `Close to budget limit`;
    }
    return `Within budget`;
  };

  console.log("SpendingInsights - Processed insights:", insights);

  return (
    <div className="space-y-4">
      {insights.map(insight => (
        <div key={insight.categoryId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{insight.category}</h4>
            <span className={getStatusColor(insight.status)}>
              {insight.percentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
            <div
              className={`h-full rounded-full ${
                insight.status === 'over'
                  ? 'bg-red-500'
                  : insight.status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(insight.percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              ${insight.spent.toFixed(2)} / ${insight.budget.toFixed(2)}
            </span>
            <span className={getStatusColor(insight.status)}>
              {getMessage(insight)}
            </span>
          </div>
        </div>
      ))}
      
      {insights.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Set budgets to see spending insights
        </p>
      )}
    </div>
  );
}