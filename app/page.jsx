'use client';

import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardSummary from './components/DashboardSummary';
import BudgetComparison from './components/BudgetComparison';
import CategoryChart from './components/CategoryChart';
import MonthlyChart from './components/MonthlyChart'; 
import SpendingInsights from './components/SpendingInsights';
import BudgetForm from './components/BudgetForm';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    transactions: null,
    budgets: null,
    form: null
  });
  const [activeTab, setActiveTab] = useState('transactions');

  // Improved data loading with timeout and better error handling
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Loading timeout safety mechanism
      const loadingTimeout = setTimeout(() => {
        setLoading(false);
        setErrors(prev => ({
          ...prev,
          transactions: prev.transactions || 'Loading timed out. Please refresh the page.',
          budgets: prev.budgets || 'Loading timed out. Please refresh the page.'
        }));
      }, 15000); // 15 second timeout

      try {
        // Load both data sources in parallel
        await Promise.all([
          fetchTransactions(),
          fetchBudgets()
        ]);
      } catch (error) {
        console.error("Error in main data loading:", error);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch transactions: ${response.status} - ${errorText || 'No error details'}`);
      }
      
      const data = await response.json();
      setTransactions(data);
      setErrors(prev => ({ ...prev, transactions: null }));
      return data;
    } catch (err) {
      console.error('Transaction fetch error:', err);
      setErrors(prev => ({ 
        ...prev, 
        transactions: err.message || 'Failed to load transactions. Please try again.' 
      }));
      
      // Return empty array to allow the app to still render
      return [];
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      
      // Handle non-OK response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Budget fetch error:', response.status, errorText);
        
        // If 404, the endpoint doesn't exist
        if (response.status === 404) {
          setErrors(prev => ({ 
            ...prev, 
            budgets: 'Budget API endpoint not found. Using default empty budgets.' 
          }));
          
          // Initialize with empty budgets
          setBudgets({});
          return {};
        }
      }
      
      // Parse JSON
      try {
        const data = await response.json();
        setBudgets(data);
        setErrors(prev => ({ ...prev, budgets: null }));
        return data;
      } catch (parseError) {
        console.error('Budget JSON parse error:', parseError);
        throw new Error('Invalid budget data format received from server');
      }
    } catch (err) {
      console.error('Budget fetch error:', err);
      setErrors(prev => ({ 
        ...prev, 
        budgets: err.message || 'Could not connect to budget service. Using default empty budgets.' 
      }));
      
      // Use empty budget object to allow app to still function
      setBudgets({});
      return {};
    }
  };

  const handleAddTransaction = async (newTransaction) => {
    try {
      setErrors(prev => ({ ...prev, form: null }));
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction),
      });

      // Check for non-OK response first
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add transaction: ${response.status}`);
      }
      
      const data = await response.json();
      setTransactions(prev => [data, ...prev]);
    } catch (err) {
      console.error('Transaction add error:', err);
      setErrors(prev => ({ 
        ...prev, 
        form: err.message || 'Failed to add transaction. Please try again.' 
      }));
    }
  };

  const handleEditTransaction = async (updatedTransaction) => {
    try {
      setErrors(prev => ({ ...prev, form: null }));
      
      const response = await fetch(`/api/transactions/${updatedTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction),
      });

      // Check for non-OK response first
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update transaction: ${response.status}`);
      }
      
      const data = await response.json();
      setTransactions(prev =>
        prev.map(t => t._id === data._id ? data : t)
      );
    } catch (err) {
      console.error('Transaction edit error:', err);
      setErrors(prev => ({ 
        ...prev, 
        form: err.message || 'Failed to update transaction. Please try again.' 
      }));
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      setErrors(prev => ({ ...prev, form: null }));
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete transaction: ${response.status}`);
      }
      
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Transaction delete error:', err);
      setErrors(prev => ({ 
        ...prev, 
        form: err.message || 'Failed to delete transaction. Please try again.' 
      }));
    }
  };

  const handleSaveBudgets = async (newBudgets) => {
    try {
      setErrors(prev => ({ ...prev, form: null }));
      
      // Filter out Mongoose-specific fields
      const cleanBudgets = Object.keys(newBudgets).reduce((acc, key) => {
        // Only include keys that are budget categories
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          acc[key] = newBudgets[key];
        }
        return acc;
      }, {});
  
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanBudgets),
      });
  
      // Check for non-OK response first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Budget save error:', response.status, errorText);
        throw new Error(`Failed to save budgets: ${response.status}`);
      }
      
      try {
        const data = await response.json();
        setBudgets(data);
        
        // Show success message
        alert('Budgets saved successfully!');
      } catch (parseError) {
        console.error('Budget save parse error:', parseError);
        throw new Error('Invalid response format received from server');
      }
    } catch (err) {
      console.error('Budget save error:', err);
      setErrors(prev => ({ 
        ...prev, 
        form: err.message || 'Failed to save budgets. Please try again.' 
      }));
    }
  };

  // Display different error states for different parts of the app
  const renderErrorMessage = (errorKey) => {
    if (!errors[errorKey]) return null;
    
    return (
      <div className="p-3 mb-4 text-sm bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-medium">Error</p>
        <p>{errors[errorKey]}</p>
      </div>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Loading your financial dashboard...</p>
      </div>
    );
  }

  // If transactions failed to load entirely, show a dedicated error screen
  if (errors.transactions && !transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md max-w-md w-full">
          <h2 className="text-lg font-medium mb-2">Unable to load transactions</h2>
          <p className="mb-3">{errors.transactions}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-primary text-white rounded-md text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-8 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Tab Navigation - Improved with better styling */}
      <div className="flex border-b border-gray-200 mb-4">
        <button 
          className={`py-3 px-6 font-medium transition-colors duration-200 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`py-3 px-6 font-medium transition-colors duration-200 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`py-3 px-6 font-medium transition-colors duration-200 ${activeTab === 'budgets' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('budgets')}
        >
          Budgets
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="grid gap-8 md:grid-cols-[400px,1fr]">
          <div className="space-y-8">
            {renderErrorMessage('form')}
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>
          <div className="space-y-8">
            <DashboardSummary transactions={transactions} />
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        </div>
      )}

      {/* Analytics Tab - Improved Layout with better spacing */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {renderErrorMessage('transactions')}
          {renderErrorMessage('budgets')}
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Spending Analytics</h2>
          </div>
          
          {/* Added MonthlyChart at the top */}
          <div className="mb-12"> {/* Added good margin at the bottom */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Monthly Expenses Overview</h3>
                <MonthlyChart transactions={transactions} />
            </div>
          </div>
          
          {/* Other charts with improved layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column for charts with increased spacing between them */}
            <div className="space-y-12"> {/* Increased space-y from 8 to 12 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
                  <CategoryChart transactions={transactions} />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4">Budget vs. Actual</h3>
                  <BudgetComparison transactions={transactions} budgets={budgets} />
              </div>
            </div>
            
            {/* Right column for insights */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium mb-4">Spending Insights</h3>
                <div className="overflow-y-auto max-h-[calc(160vh-200px)]">
                  <SpendingInsights transactions={transactions} budgets={budgets} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* Budgets Tab */}
{activeTab === 'budgets' && (
  <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Set Your Monthly Budgets</h2>
    {renderErrorMessage('form')}
    <BudgetForm budgets={budgets} onSubmit={handleSaveBudgets} />
  </div>
)}
    </main>
  );
}