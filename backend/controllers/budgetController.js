const Budget = require('../models/Budget');

// Set a new budget
const setBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;

    // Validate required fields
    if (month === undefined || month === null || year === undefined || year === null || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Month, year, and amount are required' });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);
    const amountNum = Number(amount);

    // Validate month
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Validate year
    if (!Number.isInteger(yearNum)) {
      return res.status(400).json({ message: 'Invalid year' });
    }

    // Validate amount
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      return res.status(400).json({ message: 'Budget amount cannot be negative' });
    }

    // Check if budget already exists for this user, month, and year
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      month: monthNum,
      year: yearNum
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this month and year' });
    }

    const newBudget = new Budget({
      user: req.user.id,
      month: monthNum,
      year: yearNum,
      amount: amountNum
    });

    const savedBudget = await newBudget.save();

    return res.status(201).json(savedBudget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Budget already exists for this month and year' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get budget for the logged-in user
const getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;

    // If month and year are provided, return specific budget
    if (month && year) {
      const budget = await Budget.findOne({
        user: req.user.id,
        month: Number(month),
        year: Number(year)
      });

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found' });
      }

      return res.status(200).json(budget);
    }

    // Otherwise return all budgets for user sorted by year and month
    const budgets = await Budget.find({ user: req.user.id }).sort({ year: -1, month: -1 });
    return res.status(200).json(budgets);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a budget by ID for the logged-in user
const updateBudget = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Budget ID is required' });
    }

    // Prevent changing the user ownership
    const updateData = {};
    for (const field of ['month', 'year', 'amount']) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    // Validate fields if provided in update
    if (updateData.month !== undefined) {
      const monthNum = Number(updateData.month);
      if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ message: 'Month must be between 1 and 12' });
      }
      updateData.month = monthNum;
    }

    if (updateData.year !== undefined) {
      const yearNum = Number(updateData.year);
      if (!Number.isInteger(yearNum)) {
        return res.status(400).json({ message: 'Invalid year' });
      }
      updateData.year = yearNum;
    }

    if (updateData.amount !== undefined) {
      const amountNum = Number(updateData.amount);
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        return res.status(400).json({ message: 'Budget amount cannot be negative' });
      }
      updateData.amount = amountNum;
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.status(200).json(updatedBudget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Budget already exists for this month and year' });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a budget by ID for the logged-in user
const deleteBudget = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Budget ID is required' });
    }

    const deletedBudget = await Budget.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedBudget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Budget not found' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  setBudget,
  getBudget,
  updateBudget,
  deleteBudget
};
