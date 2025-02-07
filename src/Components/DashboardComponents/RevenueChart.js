import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';

const RevenueChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://crm-mu-sooty.vercel.app/api/data'); // Backend API
                console.log('Fetched data:', response.data);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, []);
    

    return (
        <div style={{background:'#fff', padding:'15px', borderRadius:'10px', boxShadow:'0 6px 6px rgba(0,0,0,0.1 )'}}>
            <h2>Revenue Chart</h2>
            <LineChart width={600} height={300} data={data}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
            </LineChart>
        </div>
    );
};

export default RevenueChart;
