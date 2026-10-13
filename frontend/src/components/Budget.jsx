import { useState } from 'react';

function Budget() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      'http://localhost:5000/api/budget',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          month,
          year,
          amount,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert('Budget set successfully!');

      setAmount('');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Set budget error:', error);
    alert('Unable to connect to the server.');
  }
};

  return (
    <div className="dashboard-card">
      <h2>Set Monthly Budget</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Month</label>

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        <div className="form-group">
          <label>Year</label>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Budget Amount</label>

          <input
            type="number"
            placeholder="Enter monthly budget"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button type="submit">
          Set Budget
        </button>
      </form>
    </div>
  );
}

export default Budget;