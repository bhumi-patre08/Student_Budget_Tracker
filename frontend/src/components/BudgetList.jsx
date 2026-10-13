import { useEffect, useState } from 'react';

function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);

  // Fetch all budgets
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5000/api/budget',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setBudgets(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Fetch budgets error:', error);
      }
    };

    fetchBudgets();
  }, []);

  // Delete budget
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/budget/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Budget deleted successfully!');

        setBudgets(
          budgets.filter((budget) => budget._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Delete budget error:', error);
      alert('Unable to connect to the server.');
    }
  };

  // Update budget
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/budget/${editingBudget._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month: editingBudget.month,
            year: editingBudget.year,
            amount: editingBudget.amount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Budget updated successfully!');

        setBudgets(
          budgets.map((budget) =>
            budget._id === editingBudget._id
              ? data
              : budget
          )
        );

        setEditingBudget(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Update budget error:', error);
      alert('Unable to connect to the server.');
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Budget History</h2>

      {budgets.length === 0 ? (
        <p>No budgets to display yet.</p>
      ) : (
        <div className="record-list">
          {budgets.map((budget) => (
            <div className="record-item" key={budget._id}>

              {editingBudget &&
              editingBudget._id === budget._id ? (
                <div className="record-editor">
                  <h3>Edit Budget</h3>

                  <p>
                    <strong>Month:</strong>{' '}
                    {editingBudget.month}
                  </p>

                  <p>
                    <strong>Year:</strong>{' '}
                    {editingBudget.year}
                  </p>

                  <div className="form-group">
                    <label>Budget Amount</label>

                    <input
                      type="number"
                      value={editingBudget.amount}
                      onChange={(e) =>
                        setEditingBudget({
                          ...editingBudget,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button onClick={handleUpdate}>
                    Save
                  </button>

                  <button
                    onClick={() => setEditingBudget(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="record-details">
                  <p>
                    <strong>Month:</strong> {budget.month}
                  </p>

                  <p>
                    <strong>Year:</strong> {budget.year}
                  </p>

                  <p>
                    <strong>Budget Amount:</strong> ₹
                    {budget.amount}
                  </p>

                  <button
                    onClick={() => setEditingBudget(budget)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(budget._id)}
                  >
                    Delete
                  </button>
                </div>
              )}

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BudgetList;