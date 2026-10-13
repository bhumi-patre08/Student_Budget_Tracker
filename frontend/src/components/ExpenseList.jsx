import { useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES, normalizeExpenseCategory } from '../categories';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5000/api/expenses',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setExpenses(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Fetch expenses error:', error);
      }
    };

    fetchExpenses();
  }, []);

  // Delete expense
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/expenses/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Expense deleted successfully!');

        setExpenses(
          expenses.filter((expense) => expense._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Delete expense error:', error);
      alert('Unable to connect to the server.');
    }
  };

  // Update expense
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/expenses/${editingExpense._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: editingExpense.amount,
            category: editingExpense.category,
            description: editingExpense.description,
            date: editingExpense.date,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Expense updated successfully!');

        setExpenses(
          expenses.map((expense) =>
            expense._id === editingExpense._id
              ? data
              : expense
          )
        );

        setEditingExpense(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Update expense error:', error);
      alert('Unable to connect to the server.');
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Expense History</h2>

      {expenses.length === 0 ? (
        <p>No expenses to display yet.</p>
      ) : (
        <div className="record-list">
          {expenses.map((expense) => (
            <div className="record-item" key={expense._id}>

              {editingExpense &&
              editingExpense._id === expense._id ? (
                <div className="record-editor">
                  <h3>Edit Expense</h3>

                  <div className="form-group">
                    <label>Amount</label>

                    <input
                      type="number"
                      value={editingExpense.amount}
                      onChange={(e) =>
                        setEditingExpense({
                          ...editingExpense,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>

                    <select
                      value={normalizeExpenseCategory(editingExpense.category)}
                      onChange={(e) =>
                        setEditingExpense({
                          ...editingExpense,
                          category: e.target.value,
                        })
                      }
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <input
                      type="text"
                      value={editingExpense.description || ''}
                      onChange={(e) =>
                        setEditingExpense({
                          ...editingExpense,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>

                    <input
                      type="date"
                      value={
                        editingExpense.date
                          ? new Date(editingExpense.date)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setEditingExpense({
                          ...editingExpense,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button onClick={handleUpdate}>
                    Save
                  </button>

                  <button
                    onClick={() => setEditingExpense(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="record-details">
                  <p>
                    <strong>Amount:</strong> ₹{expense.amount}
                  </p>

                  <p>
                    <strong>Category:</strong> {normalizeExpenseCategory(expense.category)}
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {expense.description || 'No description'}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() =>
                      setEditingExpense({
                        ...expense,
                        category: normalizeExpenseCategory(expense.category),
                      })
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>

                  <hr />
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseList; 