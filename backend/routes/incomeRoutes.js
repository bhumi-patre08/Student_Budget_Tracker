const express = require('express');
const {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected income routes
router.post('/', authMiddleware, addIncome);
router.get('/', authMiddleware, getIncome);
router.put('/:id', authMiddleware, updateIncome);
router.delete('/:id', authMiddleware, deleteIncome);

module.exports = router;
