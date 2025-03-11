'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import TransactionForm from './TransactionForm';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TransactionList({ transactions, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
  };

  const handleUpdate = (updatedData) => {
    onEdit({ ...updatedData, _id: editingId });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(id);
    }
  };

  const chartData = {
    labels: transactions.map(t => t.description),
    datasets: [{
      label: 'Transaction Amounts',
      data: transactions.map(t => t.amount),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <Bar data={chartData} />
        {transactions.map((transaction) => (
          <div key={transaction._id} className="py-4">
            {editingId === transaction._id ? (
              <TransactionForm
                initialData={transaction}
                onSubmit={handleUpdate}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">
                    ${transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}