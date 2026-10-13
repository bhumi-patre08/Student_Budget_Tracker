const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Get dashboard summary data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current month and current year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 to 12

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Run independent database queries in parallel
    const [
      currentMonthIncomes,
      currentMonthExpenses,
      budget,
      recentIncomes,
      recentExpenses
    ] = await Promise.all([
      Income.find({
        user: userId,
        date: { $gte: startOfMonth, $lt: endOfMonth }
      }),
      Expense.find({
        user: userId,
        date: { $gte: startOfMonth, $lt: endOfMonth }
      }),
      Budget.findOne({
        user: userId,
        month: currentMonth,
        year: currentYear
      }),
      Income.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5).lean()
    ]);

    // Calculate totals for current month
    const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;
    const monthlyBudget = budget ? budget.amount : 0;
    const budgetRemaining = monthlyBudget - totalExpenses;

    // Combine and sort the 5 most recent transactions
    const formattedIncomes = recentIncomes.map((item) => ({
      ...item,
      type: 'income'
    }));
    const formattedExpenses = recentExpenses.map((item) => ({
      ...item,
      type: 'expense'
    }));

    const recentTransactions = [...formattedIncomes, ...formattedExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return res.status(200).json({
      totalIncome,
      totalExpenses,
      remainingBalance,
      monthlyBudget,
      budgetRemaining,
      recentTransactions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboard
};
