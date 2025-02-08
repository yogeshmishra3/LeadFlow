import React, { useEffect, useState } from 'react';

const Finance = () => {
  const [qualifiedDeals, setQualifiedDeals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [financeDetails, setFinanceDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [paymentType, setPaymentType] = useState("Advanced Payment");
  const [amountToPay, setAmountToPay] = useState("");

  useEffect(() => {
    const fetchQualifiedDeals = async () => {
      try {
        const response = await fetch('https://crm-mu-sooty.vercel.app/api/dealmanagement');
        if (!response.ok) throw new Error("Failed to fetch deals.");

        const dealsData = await response.json();
        const filteredDeals = dealsData.filter(deal => deal.stage === "Qualified");

        const dealDetails = filteredDeals.map(deal => ({
          id: deal._id || deal.id,
          dealName: deal.leadName || deal.name,
          clientName: deal.name || deal.leadName,
          projectName: deal.projectName || deal.name,
          amount: deal.amount || 0,
        }));

        setQualifiedDeals(dealDetails);
      } catch (error) {
        console.error("Error fetching deals:", error);
      }
    };

    const fetchProjectsDetails = async () => {
      try {
        const response = await fetch('https://crm-mu-sooty.vercel.app/api/projectsDetails');
        if (!response.ok) throw new Error("Failed to fetch project details.");

        const projectsData = await response.json();
        const projectDueDates = projectsData.reduce((acc, project) => {
          acc[project.name] = project.dueDate;
          return acc;
        }, {});

        setProjects(projectDueDates);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    const fetchFinanceDetails = async () => {
      try {
        const response = await fetch('https://crm-mu-sooty.vercel.app/api/financeDetails');
        if (!response.ok) throw new Error("Failed to fetch finance details.");

        const financeData = await response.json();
        const financeMap = financeData.reduce((acc, finance) => {
          acc[finance.id] = finance;
          return acc;
        }, {});

        setFinanceDetails(financeMap);
      } catch (error) {
        console.error("Error fetching finance details:", error);
      }
    };

    fetchQualifiedDeals();
    fetchProjectsDetails();
    fetchFinanceDetails();
  }, []);

  const openModal = (deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDeal(null);
    setAmountToPay("");
    setPaymentType("Advanced Payment");
  };

  const handleSave = async () => {
    if (!selectedDeal) return;

    const { id, dealName, clientName, projectName, amount } = selectedDeal;
    const dueDate = projects[projectName] || "No due date";
    const existingFinance = financeDetails[id] || {};

    const totalPaid = (existingFinance.advancePayment || 0) +
      (existingFinance.midPayment || 0) +
      (existingFinance.finalPayment || 0);

    const balance = amount - totalPaid;

    if (Number(amountToPay) > balance) {
      alert(`Payment amount cannot exceed the balance amount: ${balance}`);
      return;
    }

    // Prevent editing payments once made
    if (paymentType === "Advanced Payment" && existingFinance.advancePayment > 0) {
      alert("Advanced Payment has already been completed and cannot be edited.");
      return;
    }

    if (paymentType === "Mid Payment") {
      if ((existingFinance.advancePayment || 0) === 0) {
        alert("Mid Payment cannot be done until Advanced Payment is completed.");
        return;
      }
      if (existingFinance.midPayment > 0) {
        alert("Mid Payment has already been completed and cannot be edited.");
        return;
      }
    }

    if (paymentType === "Final Payment") {
      if ((existingFinance.midPayment || 0) === 0) {
        alert("Final Payment cannot be done until Mid Payment is completed.");
        return;
      }
      if (existingFinance.finalPayment > 0) {
        alert("Final Payment has already been completed and cannot be edited.");
        return;
      }
      if (Number(amountToPay) !== balance) {
        alert(`Final Payment must be exactly the remaining balance: ${balance}`);
        return;
      }
    }

    const updatedFinance = {
      id,
      dealName,
      clientName,
      dueDate,
      amount,
      [
        paymentType === "Advanced Payment"
          ? "advancePayment"
          : paymentType === "Mid Payment"
            ? "midPayment"
            : "finalPayment"
      ]: Number(amountToPay),
    };

    try {
      const response = await fetch('https://crm-mu-sooty.vercel.app/api/financeDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFinance),
      });

      if (!response.ok) throw new Error("Failed to save finance details.");

      const savedData = await response.json();

      setFinanceDetails((prevFinance) => ({
        ...prevFinance,
        [savedData.id]: savedData,
      }));

      alert("Finance details saved successfully!");
      closeModal();
    } catch (error) {
      console.error("Error saving finance details:", error);
    }
  };




  return (
    <div style={{ marginLeft: '17%', padding: '20px' }}>
      <h1>Finance Details</h1>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Client Name</th>
            <th>Due Date</th>
            <th>Advanced Payment</th>
            <th>Mid Payment</th>
            <th>Final Payment</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {qualifiedDeals.map((deal) => {
            const finance = financeDetails[deal.id] || {};
            const balance = deal.amount - ((finance.advancePayment || 0) + (finance.midPayment || 0) + (finance.finalPayment || 0));

            return (
              <tr key={deal.id}>
                <td>{deal.dealName}</td>
                <td>{deal.clientName}</td>
                <td>{projects[deal.projectName] || "No due date"}</td>
                <td style={{ color: "#0017B0", fontWeight: 'bold' }}>{finance.advancePayment || 0}</td>
                <td style={{ color: "#ffc600", fontWeight: 'bold' }}>{finance.midPayment || 0}</td>
                <td style={{ color: "green", fontWeight: 'bold' }}>{finance.finalPayment || 0}</td>
                <td style={{ fontWeight: 'bold' }}>{deal.amount} </td>
                <td style={{ color: "red", fontWeight: 'bold' }}>{balance}</td>
                <td>{balance === 0 ? "Completed" : "Pending"}</td>
                <td>
                  <button onClick={() => openModal(deal)}>Edit</button>
                </td>
              </tr>
            );
          })}
        </tbody>

      </table>
      {showModal && selectedDeal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Finance Details</h2>
            <p><strong>Project Name:</strong> {selectedDeal.dealName}</p>
            <p><strong>Client Name:</strong> {selectedDeal.clientName}</p>
            <p><strong>Due Date:</strong> {projects[selectedDeal.projectName] || "No due date"}</p>

            {/* Calculate balance safely */}
            {financeDetails[selectedDeal.id] && (
              <>
                <p><strong>Balance Amount:</strong> {selectedDeal.amount - ((financeDetails[selectedDeal.id].advancePayment) + (financeDetails[selectedDeal.id].midPayment) + (financeDetails[selectedDeal.id].finalPayment))}</p>

                <label>Amount to Pay:</label>
                <input
                  type="number"
                  value={amountToPay}
                  onChange={(e) => {
                    const value = e.target.value;

                    // Prevent negative values
                    if (value < 0) {
                      alert("Amount cannot be negative.");
                      return;
                    }

                    const balance = selectedDeal.amount - ((financeDetails[selectedDeal.id]?.advancePayment) +
                      (financeDetails[selectedDeal.id]?.midPayment) +
                      (financeDetails[selectedDeal.id]?.finalPayment));

                    // If it's final payment, enforce exact balance amount
                    if (paymentType === "Final Payment" && value !== balance) {
                      alert(`Final Payment must be exactly: ${balance}`);
                      return;
                    }

                    setAmountToPay(value);
                  }}
                />


                <label>Payment Type:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="Advanced Payment" disabled={financeDetails[selectedDeal.id]?.advancePayment > 0}>
                    Advanced Payment {financeDetails[selectedDeal.id]?.advancePayment > 0 ? "(Paid)" : ""}
                  </option>
                  <option value="Mid Payment" disabled={financeDetails[selectedDeal.id]?.midPayment > 0 || (financeDetails[selectedDeal.id]?.advancePayment || 0) === 0}>
                    Mid Payment {financeDetails[selectedDeal.id]?.midPayment > 0 ? "(Paid)" : ""}
                  </option>
                  <option value="Final Payment" disabled={financeDetails[selectedDeal.id]?.finalPayment > 0 || (financeDetails[selectedDeal.id]?.midPayment || 0) === 0}>
                    Final Payment {financeDetails[selectedDeal.id]?.finalPayment > 0 ? "(Paid)" : ""}
                  </option>
                </select>
              </>
            )}

            <button onClick={handleSave}>Save</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Finance;