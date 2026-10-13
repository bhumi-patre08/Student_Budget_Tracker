const express = require('express');
const {
  setBudget,
  getBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected budget routes
router.post('/', authMiddleware, setBudget);
router.get('/', authMiddleware, getBudget);
router.put('/:id', authMiddleware, updateBudget);
router.delete('/:id', authMiddleware, deleteBudget);

module.exports = router;
