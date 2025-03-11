'use client';

import {Card, CardHeader, CardTitle, CardContent} from "./ui/card"

export default function DashboardSummary({ transactions }) {
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-muted-foreground">{category}</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.slice(0, 3).map(transaction => (
              <div key={transaction._id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <span className="font-medium">${transaction.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}