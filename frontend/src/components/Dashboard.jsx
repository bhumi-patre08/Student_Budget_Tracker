import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../categories';
import { BrandMark, ThemeToggle } from './Brand';
import TransactionHistory from './TransactionHistory';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#2563eb', '#60a5fa', '#1d4ed8', '#38bdf8', '#93c5fd', '#0ea5e9', '#3b82f6', '#bfdbfe', '#4f83ee', '#0284c7'];
const navigationItems = [
  { id: 'overview', label: 'Overview', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { id: 'income', label: 'Income', icon: 'M12 19V5m-7 7 7-7 7 7' },
  { id: 'expense', label: 'Expenses', icon: 'M12 5v14m7-7-7 7-7-7' },
  { id: 'budget', label: 'Budget', icon: 'M4 5h16v14H4zM8 9h8M8 13h5' },
  { id: 'transactions', label: 'Transactions', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'reports', label: 'Reports', icon: 'M4 19V5m0 14h16M8 15v-4m4 4V7m4 8V9' },
];

const currency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const currentMonth = () => new Date().getMonth();
const currentYear = () => new Date().getFullYear();
const userFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an unreadable response.');
  }
  if (!response.ok) {
    const error = new Error(data.message || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function Icon({ path, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function ChartEmpty({ message = 'Add a transaction to see your insights here.' }) {
  return <div className="chart-empty">{message}</div>;
}

function TransactionForm({ onSubmit, saving, defaultType = 'expense' }) {
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const changeType = (nextType) => {
    setType(nextType);
    setCategory(nextType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSubmit({ type, amount: Number(amount), category, description, date });
    if (saved) {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <form className="transaction-form" onSubmit={submit}>
      <div className="form-toggle" role="group" aria-label="Transaction type">
        <button className={type === 'expense' ? 'selected expense-choice' : ''} type="button" onClick={() => changeType('expense')}>Expense</button>
        <button className={type === 'income' ? 'selected income-choice' : ''} type="button" onClick={() => changeType('income')}>Income</button>
      </div>
      <label className="form-field">
        Amount
        <span className="amount-input"><span>₹</span><input required min="0.01" step="0.01" type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} /></span>
      </label>
      <label className="form-field">
        {type === 'income' ? 'Source' : 'Category'}
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label className="form-field">
        Description <span className="optional-label">Optional</span>
        <input maxLength="120" type="text" placeholder={type === 'income' ? 'e.g. Monthly allowance' : 'e.g. Lunch with friends'} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="form-field">
        Date
        <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <button className="primary-button form-submit" disabled={saving} type="submit">{saving ? 'Saving…' : 'Add transaction'}</button>
    </form>
  );
}

function SummaryCard({ title, amount, note, kind, icon }) {
  return (
    <article className={`summary-card ${kind}`}>
      <div className="summary-card-top"><span>{title}</span><span className="summary-icon"><Icon path={icon} /></span></div>
      <strong>{currency(amount)}</strong>
      <small>{note}</small>
    </article>
  );
}

function Dashboard({ theme, onToggleTheme }) {
  const token = localStorage.getItem('token');
  const user = userFromStorage();
  const [activePage, setActivePage] = useState(() => {
    const page = window.location.hash.slice(1);
    return navigationItems.some((item) => item.id === page) ? page : 'overview';
  });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [reportYear, setReportYear] = useState(currentYear());
  const [reportMonth, setReportMonth] = useState(currentMonth());
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTransactions([]);
    setBudgets([]);
    window.location.reload();
  }, []);

  const fetchData = useCallback(async (signal) => {
    const [expenses, incomes, nextBudgets] = await Promise.all([
      apiRequest('/expenses', token, { signal }),
      apiRequest('/income', token, { signal }),
      apiRequest('/budget', token, { signal }),
    ]);
    const combined = [
      ...expenses.map((item) => ({
        ...item,
        id: item._id,
        type: 'expense',
        category: item.category,
        title: item.description || item.category,
      })),
      ...incomes.map((item) => ({
        ...item,
        id: item._id,
        type: 'income',
        category: item.source,
        title: item.description || item.source,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    return { transactions: combined, budgets: nextBudgets };
  }, [token]);

  useEffect(() => {
    const controller = new AbortController();
    const initialize = async () => {
      try {
        const data = await fetchData(controller.signal);
        if (!controller.signal.aborted) {
          setTransactions(data.transactions);
          setBudgets(data.budgets);
          setError('');
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError' || controller.signal.aborted) return;
        if (requestError.status === 401) logout();
        else setError(requestError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    queueMicrotask(() => {
      if (!controller.signal.aborted) void initialize();
    });
    return () => controller.abort();
  }, [fetchData, logout, user.id]);

  const refreshData = async () => {
    try {
      const data = await fetchData();
      setTransactions(data.transactions);
      setBudgets(data.budgets);
      setError('');
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message);
    }
  };

  useEffect(() => {
    const syncPage = () => {
      const page = window.location.hash.slice(1);
      setActivePage(navigationItems.some((item) => item.id === page) ? page : 'overview');
    };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  const now = new Date();
  const monthTransactions = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const total = (items, type) => items.filter((item) => item.type === type).reduce((sum, item) => sum + Number(item.amount), 0);
  const monthIncome = total(monthTransactions, 'income');
  const monthExpenses = total(monthTransactions, 'expense');
  const monthSavings = monthIncome - monthExpenses;
  const currentBudget = budgets.find((item) => Number(item.month) === now.getMonth() + 1 && Number(item.year) === now.getFullYear());
  const budgetLimit = Number(currentBudget?.amount || 0);
  const budgetProgress = budgetLimit ? Math.min((monthExpenses / budgetLimit) * 100, 100) : 0;
  const page = navigationItems.find((item) => item.id === activePage) || navigationItems[0];

  const reportTransactions = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === Number(reportYear) && (activePage !== 'reports' || reportMonth === 'year' || date.getMonth() === Number(reportMonth));
  });
  const reportIncome = total(reportTransactions, 'income');
  const reportExpenses = total(reportTransactions, 'expense');
  const reportSavings = reportIncome - reportExpenses;
  const reportMonths = MONTHS.map((month, index) => {
    const subset = transactions.filter((item) => {
      const date = new Date(item.date);
      return date.getFullYear() === Number(reportYear) && date.getMonth() === index;
    });
    return { month, income: total(subset, 'income'), expenses: total(subset, 'expense'), savings: total(subset, 'income') - total(subset, 'expense') };
  });
  const categories = Object.entries(reportTransactions.filter((item) => item.type === 'expense').reduce((grouped, item) => {
    grouped[item.category] = (grouped[item.category] || 0) + Number(item.amount);
    return grouped;
  }, {})).map(([name, value]) => ({ name, value }));

  const changePage = (nextPage) => {
    setActivePage(nextPage);
    setMobileNavigationOpen(false);
    window.history.replaceState(null, '', `#${nextPage}`);
  };

  const addTransaction = async (transaction) => {
    setSaving(true);
    setError('');
    try {
      const isIncome = transaction.type === 'income';
      await apiRequest(isIncome ? '/income' : '/expenses', token, {
        method: 'POST',
        body: JSON.stringify({
          amount: transaction.amount,
          ...(isIncome ? { source: transaction.category } : { category: transaction.category }),
          description: transaction.description,
          date: transaction.date,
        }),
      });
      await refreshData();
      return true;
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateTransaction = async (transaction, changes) => {
    const isIncome = transaction.type === 'income';
    try {
      await apiRequest(`/${isIncome ? 'income' : 'expenses'}/${transaction.id}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          amount: Number(changes.amount),
          ...(isIncome ? { source: changes.category } : { category: changes.category }),
          description: changes.description,
          date: changes.date,
        }),
      });
      await refreshData();
      return true;
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message);
      return false;
    }
  };

  const deleteTransaction = async (transaction) => {
    try {
      await apiRequest(`/${transaction.type === 'income' ? 'income' : 'expenses'}/${transaction.id}`, token, { method: 'DELETE' });
      await refreshData();
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message);
    }
  };

  const saveBudget = async (event) => {
    event.preventDefault();
    setBudgetSaving(true);
    setError('');
    try {
      if (currentBudget) {
        await apiRequest(`/budget/${currentBudget._id}`, token, {
          method: 'PUT',
          body: JSON.stringify({ amount: Number(budgetAmount) }),
        });
      } else {
        await apiRequest('/budget', token, {
          method: 'POST',
          body: JSON.stringify({ month: now.getMonth() + 1, year: now.getFullYear(), amount: Number(budgetAmount) }),
        });
      }
      setBudgetAmount('');
      await refreshData();
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message);
    } finally {
      setBudgetSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><BrandMark className="loading-brand-mark" /><p>Preparing your money snapshot…</p></div>;

  const empty = transactions.length === 0;
  const welcomeName = user.name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar${mobileNavigationOpen ? ' sidebar-open' : ''}`}>
        <a className="sidebar-brand" href="#overview" onClick={() => setMobileNavigationOpen(false)}>
          <BrandMark />
        </a>
        <p className="sidebar-label">YOUR SPACE</p>
        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={`sidebar-link${activePage === item.id ? ' active' : ''}`} aria-current={activePage === item.id ? 'page' : undefined} onClick={() => changePage(item.id)}>
              <Icon path={item.icon} className="navigation-icon" /><span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-footer"><span className="account-avatar">{welcomeName.charAt(0).toUpperCase()}</span><span className="account-label">{user.name || user.email || 'Your account'}</span></div>
      </aside>
      {mobileNavigationOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)} />}

      <main className="dashboard-main">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <button className="mobile-menu-toggle" type="button" aria-label={mobileNavigationOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNavigationOpen} onClick={() => setMobileNavigationOpen(!mobileNavigationOpen)}><span /><span /><span /></button>
            <div className="page-heading"><p className="eyebrow">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(now)}</p><h1>{activePage === 'overview' ? `Good day, ${welcomeName}` : page.label}</h1></div>
            <div className="header-actions"><ThemeToggle theme={theme} onToggleTheme={onToggleTheme} compact /><button className="logout-button" type="button" onClick={logout}>Log out</button></div>
          </header>

          {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={() => setError('')}>Dismiss</button></div>}

          {activePage === 'overview' && (
            <section className="dashboard-section">
              <div className="section-intro"><div><p className="eyebrow">YOUR FINANCES, AT A GLANCE</p><h2>A little clarity goes a long way.</h2><p>Here’s how your money is doing this month.</p></div><button className="primary-button" onClick={() => changePage('transactions')} type="button"><span aria-hidden="true">+</span> Add transaction</button></div>
              <div className="dashboard-cards">
                <SummaryCard title="Income" amount={monthIncome} note="This month" kind="income" icon="M12 19V5m-7 7 7-7 7 7" />
                <SummaryCard title="Expenses" amount={monthExpenses} note="This month" kind="expense" icon="M12 5v14m7-7-7 7-7-7" />
                <SummaryCard title="Savings" amount={monthSavings} note="Income minus expenses" kind="savings" icon="M4 12h16m-8-8v16" />
                <SummaryCard title="Monthly budget" amount={budgetLimit} note={budgetLimit ? `${currency(Math.max(budgetLimit - monthExpenses, 0))} left` : 'Set a spending limit'} kind="budget" icon="M4 5h16v14H4zM8 9h8M8 13h5" />
              </div>
              <div className="overview-grid">
                <article className="panel budget-progress-panel">
                  <div className="panel-heading"><div><h3>Monthly budget</h3><p>{budgetLimit ? 'Your spending progress' : 'Make a plan for your spending'}</p></div><button className="text-button" type="button" onClick={() => changePage('budget')}>{budgetLimit ? 'Manage' : 'Set budget'} <span aria-hidden="true">→</span></button></div>
                  {budgetLimit ? <><div className="budget-progress-label"><strong>{currency(monthExpenses)}</strong><span>of {currency(budgetLimit)}</span></div><div className="progress-track"><span className={budgetProgress >= 100 ? 'over-budget' : ''} style={{ width: `${budgetProgress}%` }} /></div><p className="progress-caption">{budgetProgress >= 100 ? 'You’ve reached your monthly limit.' : `${Math.round(budgetProgress)}% of your budget used`}</p></> : <p className="panel-empty">Set a monthly spending limit to track your progress here.</p>}
                </article>
                <article className="panel recent-panel">
                  <div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money moves</p></div><button className="text-button" type="button" onClick={() => changePage('transactions')}>See all <span aria-hidden="true">→</span></button></div>
                  {transactions.slice(0, 4).length ? <div className="recent-list">{transactions.slice(0, 4).map((item) => <div className="recent-item" key={item.id}><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><span className="recent-description"><strong>{item.title}</strong><small>{item.category} · {new Date(item.date).toLocaleDateString()}</small></span><strong className={`recent-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{currency(item.amount)}</strong></div>)}</div> : <div className="panel-empty"><span className="empty-illustration">₹</span><strong>Your story starts here</strong><span>Add your first transaction to see it show up here.</span><button className="text-button" type="button" onClick={() => changePage('transactions')}>Add a transaction →</button></div>}
                </article>
              </div>
              {empty && <div className="welcome-banner"><span className="welcome-icon">✦</span><div><strong>Welcome to your fresh start</strong><p>Your dashboard is ready. Add an income or expense to begin building a clearer picture of your money.</p></div><button className="secondary-button" type="button" onClick={() => changePage('transactions')}>Get started</button></div>}
            </section>
          )}

          {(activePage === 'income' || activePage === 'expense' || activePage === 'transactions') && (
            <section className="dashboard-section page-grid">
              <article className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">KEEP IT UP TO DATE</p><h3>{activePage === 'income' ? 'Add income' : activePage === 'expense' ? 'Add an expense' : 'Add a transaction'}</h3><p>Every small entry helps you see the full picture.</p></div></div><TransactionForm key={activePage} onSubmit={addTransaction} saving={saving} defaultType={activePage === 'income' ? 'income' : 'expense'} /></article>
              <TransactionHistory transactions={transactions} onUpdate={updateTransaction} onDelete={deleteTransaction} onlyType={activePage === 'income' || activePage === 'expense' ? activePage : 'all'} />
            </section>
          )}

          {activePage === 'budget' && (
            <section className="dashboard-section budget-page-grid">
              <article className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">PLAN AHEAD</p><h3>{currentBudget ? 'Update this month’s budget' : 'Set a monthly budget'}</h3><p>Budgets keep your goals visible without getting in the way.</p></div></div>
                <form className="transaction-form budget-form" onSubmit={saveBudget}><label className="form-field">Monthly limit<span className="amount-input"><span>₹</span><input required min="0.01" step="0.01" type="number" inputMode="decimal" placeholder={currentBudget ? String(currentBudget.amount) : '0.00'} value={budgetAmount} onChange={(event) => setBudgetAmount(event.target.value)} /></span></label><button className="primary-button form-submit" disabled={budgetSaving} type="submit">{budgetSaving ? 'Saving…' : currentBudget ? 'Update budget' : 'Save budget'}</button></form>
              </article>
              <article className="panel budget-detail-panel"><div className="panel-heading"><div><h3>This month</h3><p>Budget progress based on your expenses</p></div></div>{budgetLimit ? <><div className="budget-detail-amount">{currency(monthExpenses)}<span> / {currency(budgetLimit)}</span></div><div className="progress-track"><span className={budgetProgress >= 100 ? 'over-budget' : ''} style={{ width: `${budgetProgress}%` }} /></div><div className="budget-detail-footer"><span>{Math.round(budgetProgress)}% used</span><strong>{currency(Math.max(0, budgetLimit - monthExpenses))} remaining</strong></div></> : <div className="panel-empty"><span className="empty-illustration">◎</span><strong>No budget set yet</strong><span>Set a monthly limit to make your progress visible.</span></div>}</article>
            </section>
          )}

          {activePage === 'reports' && (
            <section className="dashboard-section">
              <div className="section-intro reports-intro"><div><p className="eyebrow">BUILT FROM YOUR TRANSACTIONS</p><h2>Understand your money.</h2><p>Every figure and chart updates when you change a transaction.</p></div><div className="report-filters"><label>Year<select value={reportYear} onChange={(event) => setReportYear(event.target.value)}>{[currentYear(), currentYear() - 1, currentYear() - 2, currentYear() - 3, currentYear() - 4].map((year) => <option key={year} value={year}>{year}</option>)}</select></label><label>Period<select value={reportMonth} onChange={(event) => setReportMonth(event.target.value)}><option value="year">Full year</option>{MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}</select></label></div></div>
              <div className="dashboard-cards report-cards">
                <SummaryCard title="Income" amount={reportIncome} note={reportMonth === 'year' ? `In ${reportYear}` : `${MONTHS[Number(reportMonth)]} ${reportYear}`} kind="income" icon="M12 19V5m-7 7 7-7 7 7" />
                <SummaryCard title="Expenses" amount={reportExpenses} note={reportMonth === 'year' ? `In ${reportYear}` : `${MONTHS[Number(reportMonth)]} ${reportYear}`} kind="expense" icon="M12 5v14m7-7-7 7-7-7" />
                <SummaryCard title="Savings" amount={reportSavings} note="Income minus expenses" kind="savings" icon="M4 12h16m-8-8v16" />
              </div>
              {reportTransactions.length === 0 ? <div className="empty-report"><span className="empty-illustration">⌁</span><h3>No transactions in this period</h3><p>Add income or expenses for {reportMonth === 'year' ? reportYear : `${MONTHS[Number(reportMonth)]} ${reportYear}`} to bring your reports to life.</p><button className="primary-button" type="button" onClick={() => changePage('transactions')}>Add a transaction</button></div> : <div className="charts-grid">
                <article className="panel chart-panel chart-wide"><div className="panel-heading"><div><h3>Monthly income &amp; expenses</h3><p>Month-by-month view for {reportYear}</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={reportMonths} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis width={52} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`} /><Tooltip formatter={(value) => currency(value)} /><Bar dataKey="income" name="Income" fill="#2563eb" radius={[5, 5, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#60a5fa" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
                <article className="panel chart-panel"><div className="panel-heading"><div><h3>Spending by category</h3><p>{reportMonth === 'year' ? reportYear : `${MONTHS[Number(reportMonth)]} ${reportYear}`}</p></div></div>{categories.length ? <div className="chart-wrap donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="name" innerRadius="57%" outerRadius="82%" paddingAngle={3}>{categories.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => currency(value)} /></PieChart></ResponsiveContainer></div> : <ChartEmpty />}<div className="category-legend">{categories.map((item, index) => <span key={item.name}><i style={{ backgroundColor: COLORS[index % COLORS.length] }} />{item.name}<strong>{currency(item.value)}</strong></span>)}</div></article>
                <article className="panel chart-panel chart-wide"><div className="panel-heading"><div><h3>Savings trend</h3><p>Monthly balance: income less expenses</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={reportMonths} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis width={52} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `₹${value / 1000}k` : `₹${value}`} /><Tooltip formatter={(value) => currency(value)} /><Area type="monotone" dataKey="savings" name="Savings" stroke="#3979ff" fill="#dbeafe" strokeWidth={2.5} /></AreaChart></ResponsiveContainer></div></article>
              </div>}
            </section>
          )}
          <footer className="dashboard-footer">Made for real life, one rupee at a time.</footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
