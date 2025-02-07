import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import './ReportsPieCharts.css';

const ReportsPieCharts = () => {
    const [receivableData, setReceivableData] = useState([]);
    const [payableData, setPayableData] = useState([]);
    const [cashBalanceData, setCashBalanceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const receivableResponse = await axios.get('http://localhost:5000/api/reports-data/receivable');
                const payableResponse = await axios.get('http://localhost:5000/api/reports-data/payable');
                const cashBalanceResponse = await axios.get('http://localhost:5000/api/reports-data/cashbalance');

                // Log data for debugging
                console.log('Receivable Data:', receivableResponse.data);
                console.log('Payable Data:', payableResponse.data);
                console.log('Cash Balance Data:', cashBalanceResponse.data);

                // Ensure the data is in an array format
                setReceivableData(Array.isArray(receivableResponse.data) ? receivableResponse.data : []);
                setPayableData(Array.isArray(payableResponse.data) ? payableResponse.data : []);
                setCashBalanceData(Array.isArray(cashBalanceResponse.data) ? cashBalanceResponse.data : []);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, []);

    const getTotal = (data) => {
        return data.reduce((sum, entry) => sum + parseFloat(entry.value), 0).toFixed(2);
    };

    return (
        <div className="reports-container">
            {/* Receivable Section */}
            <div className="chart-card">
                <h3>Receivable Due vs Overdue</h3>
                <div className="chart-content">
                    <PieChart width={150} height={150}>
                        <Pie
                            data={receivableData}
                            dataKey="value"
                            outerRadius={60}
                            innerRadius={40}
                            paddingAngle={5}
                        >
                            {receivableData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <div className="chart-legend">
                        <h4>Total</h4>
                        <p>${getTotal(receivableData)}</p>
                        {receivableData.map((entry, index) => (
                            <div key={index} className="legend-item">
                                <span
                                    className="circle"
                                    style={{ backgroundColor: entry.color }}
                                ></span>
                                {entry.name}: {((entry.value / getTotal(receivableData)) * 100).toFixed(2)}% / ${entry.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payable Section */}
            <div className="chart-card">
                <h3>Payable Due vs Overdue</h3>
                <div className="chart-content">
                    <PieChart width={150} height={150}>
                        <Pie
                            data={payableData}
                            dataKey="value"
                            outerRadius={60}
                            innerRadius={40}
                            paddingAngle={5}
                        >
                            {payableData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <div className="chart-legend">
                        <h4>Total</h4>
                        <p>${getTotal(payableData)}</p>
                        {payableData.map((entry, index) => (
                            <div key={index} className="legend-item">
                                <span
                                    className="circle"
                                    style={{ backgroundColor: entry.color }}
                                ></span>
                                {entry.name}: {((entry.value / getTotal(payableData)) * 100).toFixed(2)}% / ${entry.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cash Balance Section */}
            <div className="chart-card">
                <h3>Cash Balance</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={cashBalanceData}>
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="balance" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReportsPieCharts;
