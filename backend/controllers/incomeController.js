const Income = require('../models/Income');

// Add a new income record
const addIncome = async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;

    // Validate required fields
    if (amount === undefined || amount === null || !source) {
      return res.status(400).json({ message: 'Amount and source are required' });
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
    }

    const incomeData = {
      user: req.user.id,
      amount: normalizedAmount,
      source
    };

    if (description !== undefined) incomeData.description = description;
    if (date !== undefined) incomeData.date = date;

    const newIncome = new Income(incomeData);
    const savedIncome = await newIncome.save();

    return res.status(201).json(savedIncome);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all income records for the logged-in user
const getIncome = async (req, res) => {
  try {
    const incomeRecords = await Income.find({ user: req.user.id }).sort({ date: -1 });
    return res.status(200).json(incomeRecords);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an income record by ID for the logged-in user
const updateIncome = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Income ID is required' });
    }

    const updateData = {};
    for (const field of ['amount', 'source', 'description', 'date']) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    if (updateData.amount !== undefined) {
      updateData.amount = Number(updateData.amount);
      if (!Number.isFinite(updateData.amount) || updateData.amount < 0) {
        return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
      }
    }

    const updatedIncome = await Income.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    return res.status(200).json(updatedIncome);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Income record not found' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an income record by ID for the logged-in user
const deleteIncome = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body._id;

    if (!id) {
      return res.status(400).json({ message: 'Income ID is required' });
    }

    const deletedIncome = await Income.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedIncome) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    return res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Income record not found' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
};
