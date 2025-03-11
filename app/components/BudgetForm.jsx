'use client';

import { useForm } from 'react-hook-form';
import { CATEGORIES } from '../constants';

export default function BudgetForm({ budgets, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: budgets,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {CATEGORIES.map(category => (
        <div key={category.id}>
          <label className="block text-sm font-medium mb-1">{category.name}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            {...register(category.id, {
              valueAsNumber: true,
              min: { value: 0, message: 'Budget cannot be negative' }
            })}
          />
          {errors[category.id] && (
            <p className="text-red-500 text-sm mt-1">{errors[category.id].message}</p>
          )}
        </div>
      ))}
      <button type="submit" className="btn btn-primary">
        Save Budgets
      </button>
    </form>
  );
}