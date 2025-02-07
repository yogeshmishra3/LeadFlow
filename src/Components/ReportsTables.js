import React from 'react';
import './ReportsTables.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const customerData = [
  { customer: 'Jonathan West', income: 1644.0, expenses: 0.0, grossProfit: 1644.0 },
  { customer: 'Clarence Norman', income: 1934.0, expenses: 0.0, grossProfit: 1934.0 },
  { customer: 'Eugene Garcia', income: 1537.0, expenses: 0.0, grossProfit: 1837.0 },
  { customer: 'Miguel Wilson', income: 2764.0, expenses: 0.0, grossProfit: 2764.0 },
  { customer: 'Estelle Norton', income: 1537.0, expenses: 0.0, grossProfit: 1537.0 },
  { customer: 'Cecilia Baldwin', income: 1837.0, expenses: 0.0, grossProfit: 1837.0 },
  { customer: 'Ann Floyd', income: 1948.0, expenses: 0.0, grossProfit: 1644.0 },
];

const overviewData = [
  { month: 'Jun', income: 40000, netIncome: 30000, expenses: 10000 },
  { month: 'Jul', income: 42000, netIncome: 31000, expenses: 11000 },
  { month: 'Aug', income: 45000, netIncome: 32000, expenses: 13000 },
  { month: 'Sep', income: 47000, netIncome: 35000, expenses: 12000 },
  { month: 'Oct', income: 49000, netIncome: 37000, expenses: 13000 },
  { month: 'Nov', income: 52000, netIncome: 38000, expenses: 14000 },
  { month: 'Dec', income: 54000, netIncome: 40000, expenses: 14000 },
];

const ReportsTables = () => {
  return (
    <div className="reports-tables-container">
      <div className="table-section">
        <div className="card">
          <h3>Top Customers</h3>
          <table style={{marginLeft:'0%'}}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {customerData.map((row, index) => (
                <tr key={index}>
                  <td>{row.customer}</td>
                  <td>${row.income.toFixed(2)}</td>
                  <td>${row.expenses.toFixed(2)}</td>
                  <td>${row.grossProfit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="view-more">View More →</button>
        </div>
      </div>

      <div className='mainCards'>
        <div className="overview-section">
        <div className="card">
          <h3>Overview</h3>
          <div className="overview-metrics">
            <div>
              <p>Income</p>
              <h4>$40,123.00</h4>
              <p className="metric-detail">$1,993.83 / month</p>
            </div>
            <div>
              <p>Net Income</p>
              <h4>$40,123.00</h4>
              <p className="metric-detail">$340.00 / month</p>
            </div>
            <div>
              <p>Expenses</p>
              <h4>$40,123.00</h4>
              <p className="metric-detail">$3,945.00 / month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overviewData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#8884d8" />
              <Line type="monotone" dataKey="netIncome" stroke="#e91e63" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mini-cards">
        <div className="mini-card">
          <p>Expenses</p>
          <h4>$40,123.00</h4>
          <p className="metric-detail">$1,993.83 / month</p>
        </div>
        <div className="mini-card">
          <p>Income (Revenue)</p>
          <h4>$34,899.43</h4>
          <p className="metric-detail">$1,993.83 / month</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ReportsTables;
