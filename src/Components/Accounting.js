import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Accounting = () => {
  const [incomeExpenses, setIncomeExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]); // State to store expense category data

  useEffect(() => {
    // Fetch Income and Expenses Data
    const fetchIncomeExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/income-expenses'); // GET request to fetch income/expenses data
        console.log('Fetched income/expenses data:', response.data);
        setIncomeExpenses(response.data);
      } catch (error) {
        console.error('Error fetching accounting data:', error);
      }
    };

    // Fetch Expense Categories Data
    const fetchExpenseCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/expenses'); // GET request to fetch expense categories
        console.log('Fetched expense categories:', response.data);
        setExpenseCategories(response.data);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
      }
    };

    fetchIncomeExpenses();
    fetchExpenseCategories();
  }, []);

  return (
    <div className="accounting-wrapper" style={{ marginLeft: '20%' }}>
      <div className="accounting-dashboard">
        <div className="accounting-card">
          <h3>Income and Expenses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={incomeExpenses}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="accounting-card">
          <h3>Expense Categories</h3>
          <table style={{ width: '100%', border: '1px solid #ccc' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories.map((category, index) => (
                <tr key={index}>
                  <td>{category.category}</td>
                  <td>{category.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
