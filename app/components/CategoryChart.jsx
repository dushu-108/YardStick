'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { CATEGORIES } from '../constants';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart({ transactions }) {
  // Debug the incoming data
  console.log('Transactions received:', transactions);

  // Fix: Normalize category values with better matching logic
  const categoryTotals = transactions.reduce((acc, transaction) => {
    // Find matching category by checking both ID and name with improved matching
    const categoryId = findCategoryId(transaction.category);
    console.log(`Transaction ${transaction._id}: Category "${transaction.category}" mapped to "${categoryId}"`);
    
    if (categoryId) {
      acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  console.log('Category totals:', categoryTotals);

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
        data: CATEGORIES.map(cat => categoryTotals[cat.id] || 0),
        backgroundColor: CATEGORIES.map(cat => cat.color),
        borderColor: CATEGORIES.map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  console.log('Chart data:', data);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `$${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Check if we have any data to display
  const hasData = data.datasets[0].data.some(value => value > 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {hasData ? (
        <Pie data={data} options={options} />
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No transaction data available for categories
        </div>
      )}
    </div>
  );
}