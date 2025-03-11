'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Other'
];

export default function TransactionForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(
    initialData || {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    if (!initialData) {
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Transaction' : 'Add Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {initialData ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}