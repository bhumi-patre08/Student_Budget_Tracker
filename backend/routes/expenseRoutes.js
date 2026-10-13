const express = require('express');
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected expense routes
router.post('/', authMiddleware, addExpense);
router.get('/', authMiddleware, getExpenses);
router.put('/:id', authMiddleware, updateExpense);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;
