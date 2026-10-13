const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
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
    source: {
      type: String,
      required: true,
      enum: [
        'Parent Allowance',
        'Part-Time Work',
        'Scholarship',
        'Salary',
        'Freelance',
        'Business',
        'Other'
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

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
