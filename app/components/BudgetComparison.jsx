'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CATEGORIES } from '../constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BudgetComparison({ transactions, budgets }) {
  // Debug the incoming data
  console.log('BudgetComparison - Transactions received:', transactions);
  console.log('BudgetComparison - Budgets received:', budgets);

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

  console.log('BudgetComparison - Category totals:', categoryTotals);

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

  const data = {
    labels: CATEGORIES.map(cat => cat.name),
    datasets: [
      {
        label: 'Budget',
        data: CATEGORIES.map(cat => budgets[cat.id] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Actual',
        data: CATEGORIES.map(cat => categoryTotals[cat.id] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  console.log('BudgetComparison - Chart data:', data);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  // Check if we have any data to display
  const hasData = data.datasets.some(dataset => 
    dataset.data.some(value => value > 0)
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {hasData ? (
        <Bar data={data} options={options} />
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No data available for budget comparison
        </div>
      )}
    </div>
  );
}