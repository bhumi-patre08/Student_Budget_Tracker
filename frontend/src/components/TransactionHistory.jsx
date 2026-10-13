import { useMemo, useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../categories';

const currency = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

function TransactionHistory({ transactions, onUpdate, onDelete, onlyType = 'all' }) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(onlyType);
  const [monthFilter, setMonthFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const availableMonths = useMemo(() => [...new Set(transactions.map((item) => {
    const date = new Date(item.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort((a, b) => b.localeCompare(a)), [transactions]);

  const filteredTransactions = useMemo(() => transactions.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesQuery = `${item.title} ${item.category} ${item.description || ''}`.toLowerCase().includes(query.trim().toLowerCase());
    const date = new Date(item.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return matchesType && matchesQuery && (!monthFilter || month === monthFilter);
  }), [transactions, typeFilter, query, monthFilter]);

  const submitEdit = async (event) => {
    event.preventDefault();
    setSavingId(editing.id);
    const succeeded = await onUpdate(editing, editing);
    if (succeeded) setEditing(null);
    setSavingId(null);
  };

  return (
    <article className="panel history-panel">
      <div className="panel-heading history-heading"><div><p className="eyebrow">YOUR MONEY, YOUR RECORD</p><h3>{onlyType === 'income' ? 'Income history' : onlyType === 'expense' ? 'Expense history' : 'Transaction history'}</h3><p>{filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}</p></div></div>
      <div className="transaction-filters">
        <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search transactions" type="search" placeholder="Search transactions" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select aria-label="Filter by type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
          <option value={onlyType}>{onlyType === 'all' ? 'All types' : `All ${onlyType === 'income' ? 'income' : 'expenses'}`}</option>
          {onlyType === 'all' && <><option value="income">Income</option><option value="expense">Expense</option></>}
        </select>
        <select aria-label="Filter by month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
          <option value="">Any month</option>
          {availableMonths.map((month) => <option key={month} value={month}>{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T00:00:00`))}</option>)}
        </select>
      </div>
      {filteredTransactions.length === 0 ? (
        <div className="history-empty"><span className="empty-illustration">↗</span><strong>{transactions.length ? 'No matches found' : 'Nothing here just yet'}</strong><span>{transactions.length ? 'Try a different search or filter.' : 'Your transactions will appear here after you add your first one.'}</span></div>
      ) : (
        <div className="transaction-list">
          {filteredTransactions.map((item) => editing?.id === item.id ? (
            <form className="transaction-edit-form" key={item.id} onSubmit={submitEdit}>
              <div className="edit-form-heading"><strong>Edit transaction</strong><button type="button" className="icon-button" aria-label="Cancel edit" onClick={() => setEditing(null)}>×</button></div>
              <label className="form-field">Amount<input required min="0.01" step="0.01" type="number" inputMode="decimal" value={editing.amount} onChange={(event) => setEditing({ ...editing, amount: event.target.value })} /></label>
              <label className="form-field">{editing.type === 'income' ? 'Source' : 'Category'}<select value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{(editing.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="form-field">Description<input maxLength="120" type="text" value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></label>
              <label className="form-field">Date<input required type="date" value={new Date(editing.date).toISOString().slice(0, 10)} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></label>
              <div className="edit-form-actions"><button className="primary-button" type="submit" disabled={savingId === editing.id}>{savingId === editing.id ? 'Saving…' : 'Save changes'}</button><button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
            </form>
          ) : (
            <div className="transaction-row" key={item.id}>
              <span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span>
              <div className="transaction-description"><strong>{item.title}</strong><span>{item.category}{item.description && item.description !== item.title ? ` · ${item.description}` : ''}</span></div>
              <span className="transaction-date">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <strong className={`transaction-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{currency(item.amount)}</strong>
              <div className="transaction-actions"><button className="icon-button" aria-label={`Edit ${item.title}`} type="button" onClick={() => setEditing({ ...item })}>Edit</button><button className="icon-button delete-action" aria-label={`Delete ${item.title}`} type="button" onClick={() => onDelete(item)}>Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export default TransactionHistory;
