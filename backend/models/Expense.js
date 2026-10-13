const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Food',
        'Housing',
        'Transport',
        'Transportation',
        'Utilities',
        'Entertainment',
        'Shopping',
        'Health',
        'Healthcare',
        'Education',
        'Travel',
        'Other',
        'Other Expenses'
      ]
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
