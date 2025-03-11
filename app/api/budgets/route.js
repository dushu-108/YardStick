import { NextResponse } from 'next/server';
import Budget from '../../../models/Budget';
import { CATEGORIES } from '../../constants';

// GET handler for fetching budgets
export async function GET() {
  try {
    // Find the first budget document or create a default one
    let budget = await Budget.findOne();
    
    // If no budget exists, create a default budget
    if (!budget) {
      const defaultBudget = CATEGORIES.reduce((acc, category) => {
        acc[category.id] = 0;
        return acc;
      }, {});

      budget = new Budget(defaultBudget);
      await budget.save();
    }
    
    // Convert to plain object
    const budgetData = budget.toObject();
    return NextResponse.json(budgetData, { status: 200 });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch budgets', error: error.message },
      { status: 500 }
    );
  }
}

// POST handler for saving budgets
export async function POST(request) {
  try {
    const budgetData = await request.json();
    
    // Validate the data
    if (!budgetData || typeof budgetData !== 'object') {
      return NextResponse.json(
        { message: 'Invalid budget data' },
        { status: 400 }
      );
    }

    // Validate budget categories match the schema
    const validCategories = CATEGORIES.map(category => category.id);
    const invalidCategories = Object.keys(budgetData).filter(
      key => !validCategories.includes(key)
    );

    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { message: `Invalid budget categories: ${invalidCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Find and update the existing budget or create a new one
    const budget = await Budget.findOneAndUpdate(
      {}, // No filter to match the first document
      budgetData,
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    // Convert to plain object
    const savedBudgetData = budget.toObject();
    return NextResponse.json(savedBudgetData, { status: 200 });
  } catch (error) {
    console.error('Error saving budgets:', error);
    return NextResponse.json(
      { message: 'Failed to save budgets', error: error.message },
      { status: 500 }
    );
  }
}