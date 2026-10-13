const Expense = require('../models/Expense');

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validate required fields
    if (amount === undefined || amount === null || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
    }

    const expenseData = {
      user: req.user.id,
      amount: normalizedAmount,
      category
    };

    if (description !== undefined) expenseData.description = description;
    if (date !== undefined) expenseData.date = date;

    const newExpense = new Expense(expenseData);
    const savedExpense = await newExpense.save();

    return res.status(201).json(savedExpense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all expenses for the logged-in user
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an expense by ID for the logged-in user
const updateExpense = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Expense ID is required' });
    }

    const updateData = {};
    for (const field of ['amount', 'category', 'description', 'date']) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    if (updateData.amount !== undefined) {
      updateData.amount = Number(updateData.amount);
      if (!Number.isFinite(updateData.amount) || updateData.amount < 0) {
        return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
      }
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json(updatedExpense);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an expense by ID for the logged-in user
const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Expense ID is required' });
    }

    const deletedExpense = await Expense.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Expense not found' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense
};
