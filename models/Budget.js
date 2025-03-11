import mongoose from 'mongoose';
import { CATEGORIES } from '../app/constants';

const BudgetSchema = new mongoose.Schema({
  ...CATEGORIES.reduce((fields, category) => {
    fields[category.id] = {
      type: Number,
      default: 0,
      min: 0
    };
    return fields;
  }, {}),
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
BudgetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model (only if it doesn't already exist)
const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

export default Budget;