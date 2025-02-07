import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopDeals = () => {
    const [topDeals, setTopDeals] = useState([]);
    const [dealsStats, setDealsStats] = useState({
        totalDeals: 0,
        contactedDeals: 0,
        qualifiedDeals: 0,
        proposalsAccepted: 0,
    });
    const [savedQuotations, setSavedQuotations] = useState([]);

    useEffect(() => {
        const fetchTopDeals = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/dealmanagement'); // Update with your deployed backend URL
                setTopDeals(response.data);
            } catch (error) {
                console.error('Error fetching top deals:', error);
            }
        };

        const fetchDealsStats = async () => {
            try {
                // Fetch deals from dealmanagement API
                const dealsResponse = await axios.get('http://localhost:5001/api/dealmanagement'); // Replace with your backend URL
                const deals = dealsResponse.data;
        
                // Exclude deals with stage 'Proposal' from the total count
                const filteredDeals = deals.filter(deal => deal.stage !== 'Proposal');
        
                // Calculate statistics based on the filtered deals
                const contactedDeals = filteredDeals.filter(deal => deal.stage === 'Contacted').length;
                const qualifiedDeals = filteredDeals.filter(deal => deal.stage === 'Qualified').length;
        
                // Fetch all the leads from the newquotations API
                const quotationsResponse = await axios.get('http://localhost:5001/api/newquotations'); // Replace with your quotations API URL
                const quotations = quotationsResponse.data;
        
                // Calculate total deals by combining filtered deals from 'dealmanagement' and all leads from 'newquotations'
                const totalDeals = filteredDeals.length + quotations.length;
        
                // Count all the leads present in the quotations data
                const proposalsAccepted = quotations.length; // All leads in the quotations count as "proposals accepted"
        
                setDealsStats({ totalDeals, contactedDeals, qualifiedDeals, proposalsAccepted });
            } catch (error) {
                console.error('Error fetching deals statistics:', error);
            }
        };
        
        
        

        const fetchSavedQuotations = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/newquotations'); // Replace with your quotations API URL
                setSavedQuotations(response.data);
            } catch (error) {
                console.error('Error fetching saved quotations:', error);
            }
        };

        fetchTopDeals();
        fetchDealsStats();
        fetchSavedQuotations();
    }, []);

    // Helper function to calculate the total amount for a quotation
    const calculateTotalAmount = (items) => {
        return items.reduce((total, item) => total + parseFloat(item.amount || 0), 0).toFixed(2);
    };

    return (
        <div>
            <h2>Top Deals</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                

                {/* Deals Statistics Section */}
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '5px', background: '#fff' }}>
                    <h3>Deals Statistics</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Category</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Total Deals</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{dealsStats.totalDeals}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Contacted Deals</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{dealsStats.contactedDeals}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Qualified Deals</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{dealsStats.qualifiedDeals}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Proposals Accepted</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{dealsStats.proposalsAccepted}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Saved Quotations Section */}
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '10px', borderRadius: '5px', background: '#fff' }}>
                    <h3>Saved Quotations</h3>
                    {savedQuotations.length === 0 ? (
                        <p>No saved quotations available</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Client Name</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Quotation No</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedQuotations.map((quotation, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{quotation.clientName}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{quotation.quotationNo}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                            ₹{calculateTotalAmount(quotation.items)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopDeals;








