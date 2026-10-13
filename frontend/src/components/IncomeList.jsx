import { useEffect, useState } from 'react';
import { INCOME_CATEGORIES, normalizeIncomeCategory } from '../categories';

function IncomeList() {
  const [income, setIncome] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);

  // Fetch income
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5000/api/income',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setIncome(data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Fetch income error:', error);
      }
    };

    fetchIncome();
  }, []);

  // Delete income
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/income/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Income deleted successfully!');

        setIncome(
          income.filter((item) => item._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Delete income error:', error);
      alert('Unable to connect to the server.');
    }
  };

  // Update income
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/income/${editingIncome._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: editingIncome.amount,
            source: editingIncome.source,
            description: editingIncome.description,
            date: editingIncome.date,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Income updated successfully!');

        setIncome(
          income.map((item) =>
            item._id === editingIncome._id
              ? data
              : item
          )
        );

        setEditingIncome(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Update income error:', error);
      alert('Unable to connect to the server.');
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Income History</h2>

      {income.length === 0 ? (
        <p>No income to display yet.</p>
      ) : (
        <div className="record-list">
          {income.map((item) => (
            <div className="record-item" key={item._id}>

              {editingIncome &&
              editingIncome._id === item._id ? (
                // Edit income form
                <div className="record-editor">
                  <h3>Edit Income</h3>

                  <div className="form-group">
                    <label>Amount</label>

                    <input
                      type="number"
                      value={editingIncome.amount}
                      onChange={(e) =>
                        setEditingIncome({
                          ...editingIncome,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Source</label>

                    <select
                      value={normalizeIncomeCategory(editingIncome.source)}
                      onChange={(e) =>
                        setEditingIncome({
                          ...editingIncome,
                          source: e.target.value,
                        })
                      }
                    >
                      {INCOME_CATEGORIES.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>

                    <input
                      type="text"
                      value={editingIncome.description || ''}
                      onChange={(e) =>
                        setEditingIncome({
                          ...editingIncome,
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
                        editingIncome.date
                          ? new Date(editingIncome.date)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setEditingIncome({
                          ...editingIncome,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button onClick={handleUpdate}>
                    Save
                  </button>

                  <button
                    onClick={() => setEditingIncome(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // Display income
                <div className="record-details">
                  <p>
                    <strong>Amount:</strong> ₹{item.amount}
                  </p>

                  <p>
                    <strong>Source:</strong> {normalizeIncomeCategory(item.source)}
                  </p>

                  <p>
                    <strong>Description:</strong>{' '}
                    {item.description || 'No description'}
                  </p>

                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(item.date).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() =>
                      setEditingIncome({
                        ...item,
                        source: normalizeIncomeCategory(item.source),
                      })
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
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

export default IncomeList;