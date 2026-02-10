// BudgetTable.tsx
import React, { useEffect, useState } from 'react';

interface Budget {
  id: number;
  title: string;
  amount: string;
  year: number;
  month: number;
  category_id: number;
  expense_subcategory_id: number;
  organization_id: number;
  created_at: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BudgetTable: React.FC = () => {
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch all budgets once
  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await fetch('/api/finance/budgets'); // No month/year params
        if (!res.ok) throw new Error('Failed to fetch budgets');
        const data: Budget[] = await res.json();
        setAllBudgets(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBudgets();
  }, []);

  // Filter budgets whenever month/year changes
  useEffect(() => {
    const filtered = allBudgets.filter(
      (b) => b.month === selectedMonth && b.year === selectedYear
    );
    setFilteredBudgets(filtered);
  }, [allBudgets, selectedMonth, selectedYear]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Budget Table</h2>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Month:
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ marginLeft: '5px' }}
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Year:
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ marginLeft: '5px', width: '80px' }}
          />
        </label>
      </div>

      {/* Budget Table */}
      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Month</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {filteredBudgets.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>No budgets found.</td>
            </tr>
          ) : (
            filteredBudgets.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.amount}</td>
                <td>{monthNames[b.month - 1]}</td>
                <td>{b.year}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
