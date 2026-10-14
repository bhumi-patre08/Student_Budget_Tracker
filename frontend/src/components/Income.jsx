import { useState } from 'react';
import { INCOME_CATEGORIES } from '../categories';

function Income() {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Parent Allowance');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/income`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          source,
          description,
          date: date || undefined,
        }),
      }
    );

    const data = await response.json();
    






    
    if (response.ok) {
      alert('Income added successfully!');

      setAmount('');
      setSource('Parent Allowance');
      setDescription('');
      setDate('');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Add income error:', error);
    alert('Unable to connect to the server.');
  }
};

  return (
    <div className="dashboard-card">
      <h2>Add Income</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
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
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button type="submit">Add Income</button>
      </form>
    </div>
  );
}

export default Income;