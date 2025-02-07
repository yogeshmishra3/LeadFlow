import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Deals.css";

const dealManagementApiUrl = "http://localhost:5000/api/dealmanagement";
const newLeadsApiUrl = "https://crm-mu-sooty.vercel.app/api/NewLeads";
const meetingsApiUrl = "http://localhost:5000/api/meetings";
const quotationsApiUrl = "http://localhost:5000/api/newquotations";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [quotationClients, setQuotationClients] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingNote, setMeetingNote] = useState("");
  const navigate = useNavigate();
  

  const stages = ["Lead", "Contacted", "Proposal", "Qualified"];

  useEffect(() => {
    fetchAndStoreNewLeads();
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 15000); // Fetch data every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAndStoreNewLeads = async () => {
    try {
      const newLeadsResponse = await fetch(newLeadsApiUrl);
      if (!newLeadsResponse.ok) {
        throw new Error("Failed to fetch new leads.");
      }
      const newLeadsData = await newLeadsResponse.json();
  
      const connectedLeads = newLeadsData.contacts.filter(
        (lead) => lead.dealStatus === "connected"
      );
  
      for (const lead of connectedLeads) {
        const { name, leadName } = lead;
        const leadData = {
            name, // Client name
            leadName, // Deal name
            stage: "Lead",
            amount: 0, // Default amount
            scheduledMeeting: new Date().toISOString(), // Default to the current date in ISO format
          };
          
  
        console.log("Sending lead data:", leadData); // Log the data being sent
  
        const existingDealResponse = await fetch(dealManagementApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
  
        if (!existingDealResponse.ok) {
          const errorData = await existingDealResponse.json(); // Get error details from response
          console.warn("Failed to store lead:", errorData); // Log the error message
        }
      }
    } catch (error) {
      console.error("Error storing new leads:", error);
    }
  };
  

  // Fetch data from deal management and quotations
  const fetchInitialData = async () => {
    try {
      const [transactionsResponse, quotationsResponse] = await Promise.all([
        fetch(dealManagementApiUrl),
        fetch(quotationsApiUrl),
      ]);

      if (!transactionsResponse.ok || !quotationsResponse.ok) {
        throw new Error("Failed to fetch data.");
      }

      const transactionsData = await transactionsResponse.json();
      const quotationsData = await quotationsResponse.json();

      // Check for duplicate deals and delete them from dealManagementApiUrl
      await deleteDuplicateDeals(transactionsData, quotationsData);

      // Map quotations data into the "Proposal" stage
      const proposalDeals = quotationsData.map((quotation) => ({
        _id: quotation._id,
        name: quotation.dealName,
        leadName: quotation.clientName,
        quotationNo: quotation.quotationNo,
        date: quotation.date,
        stage: "Proposal",
        totalAmount: quotation.items.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        ),
      }));

      // Combine transactions (from local API) and proposals (from quotations API)
      const updatedDeals = [...transactionsData, ...proposalDeals];
      setDeals(updatedDeals);

      const clientAmounts = quotationsData.reduce((acc, quotation) => {
        const { clientName, items } = quotation;
        const totalAmount = items.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );
        acc[clientName] = (acc[clientName] || 0) + totalAmount;
        return acc;
      }, {});

      setQuotationClients(clientAmounts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Delete duplicate deals from dealManagement API based on dealName and clientName
  const deleteDuplicateDeals = async (transactionsData, quotationsData) => {
    for (const quotation of quotationsData) {
        const { dealName, clientName } = quotation;

        // Find matching deal with stage "Contacted"
        const matchingDeal = transactionsData.find(
            (deal) =>
                deal.leadName === dealName &&
                deal.name === clientName &&
                deal.stage === "Contacted"
        );

        if (matchingDeal) {
            try {
                console.log(`Deleting duplicate deal: ${dealName} - ${clientName}`);
                const response = await fetch(`http://localhost:5000/api/dealmanagement/${matchingDeal._id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    console.log(`Successfully deleted: ${dealName} - ${clientName}`);
                } else {
                    const errorData = await response.json();
                    console.error(`Failed to delete. Status: ${response.status}`, errorData);
                }
            } catch (error) {
                console.error(`Error deleting deal: ${dealName} - ${clientName}`, error);
            }
        }
    }
};


  const handleScheduleMeeting = (dealId, clientName) => {
    setSelectedDealId(dealId);
    setMeetingNote(`Client name: ${clientName}\n`);
    setShowModal(true);
  };

  const submitMeeting = async () => {
    if (!meetingDate || !startTime || !endTime || !meetingNote.trim()) {
      alert("Please fill in all meeting details.");
      return;
    }

    const formattedMeeting = {
      date: meetingDate,
      startTime: startTime,
      endTime: endTime,
      note: meetingNote.trim(),
    };

    try {
      const response = await fetch(meetingsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedMeeting),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule meeting.");
      }

      alert("Meeting scheduled successfully!");
      setShowModal(false);
      fetchInitialData();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert(error.message);
    }
  };

  const handleRedirectToQuotes = (deal) => {
    navigate("/quotes", {
      state: {
      dealData: {
        dealName: deal.leadName,
        clientName: deal.name,
      },
    },
    });
  };

  const handleDragStart = (e, dealId, stage) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.setData("stage", stage);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
  
    if (!dealId) {
      alert("Invalid Deal ID");
      return;
    }
  
    const deal = deals.find((deal) => deal._id === dealId);
    if (!deal) {
      console.error("Deal not found in local state");
      return;
    }
  
    // Allow only moving from "Lead" to "Contacted"
    if (deal.stage === "Lead" && newStage !== "Contacted") {
      alert("Deals in the 'Lead' stage can only be moved to 'Contacted'.");
      return;
    }
  
    // Handle moving from "Proposal" to "Qualified" and asking for the qualified amount
    if (deal.stage === "Proposal" && newStage === "Qualified") {
      const qualifiedAmount = prompt("Enter the Qualified amount for this deal:", deal.amount);
  
      if (qualifiedAmount !== null && !isNaN(qualifiedAmount) && qualifiedAmount > 0) {
        try {
          // Delete the deal from the newquotations API
          const response = await fetch(`http://localhost:5000/api/newquotations/${dealId}`, {
            method: "DELETE",
          });
  
          if (!response.ok) {
            throw new Error("Failed to delete deal from newquotations.");
          }
  
          console.log(`Deleted deal from newquotations: ${deal.leadName}`);
  
          // Create a new deal in dealmanagement with the new Qualified amount
          const newDeal = {
            name: deal.name,
            leadName: deal.leadName,
            stage: "Qualified", // Set the stage to "Qualified"
            amount: parseFloat(qualifiedAmount), // Use the new Qualified amount
            scheduledMeeting: deal.scheduledMeeting,
          };
  
          const newDealResponse = await fetch("http://localhost:5000/api/dealmanagement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDeal),
          });
  
          if (!newDealResponse.ok) {
            throw new Error("Failed to store deal in dealmanagement.");
          }
  
          console.log(`Stored deal in dealmanagement with Qualified stage: ${deal.leadName}`);
  
          // Fetch updated data after the changes
          fetchInitialData();
        } catch (error) {
          console.error("Error handling drop:", error);
        }
      } else {
        // If the amount is invalid, notify the user
        alert("Please enter a valid amount for the Qualified stage.");
        return;
      }
    } else {
      // Normal stage change logic
      try {
        const response = await fetch(`${dealManagementApiUrl}/${dealId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update deal stage.");
        }
  
        fetchInitialData();
      } catch (error) {
        console.error("Error updating deal stage:", error);
      }
    }
  };
  
  const handleArchive = async (dealId) => {
    const confirmArchive = window.confirm("Are you sure you want to archive this deal?");
    if (!confirmArchive) {
      return;
    }
  
    try {
      // Update the deal's stage to "Archived" and move it to DeleteLeads folder
      const response = await fetch(`${dealManagementApiUrl}/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          stage: "Archived",
          moveToFolder: "DeleteLeads"  // Add this field to indicate moving to DeleteLeads folder
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to archive deal.");
      }
  
      alert("Deal archived and moved to DeleteLeads folder successfully!");
  
      // Fetch updated data after the archive action
      fetchInitialData();
    } catch (error) {
      console.error("Error archiving deal:", error);
      alert(error.message);
    }
  };
  
  
  

  return (
    <div className="deals-container">
      <div className="header">
        <h2>Leads Management</h2>
      </div>
      <div className="deals-board">
      {stages.map((stage) => (
  <div
    key={stage}
    className="column"
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => handleDrop(e, stage)}
  >
    <h3>{stage}</h3>
    {deals
      .filter((deal) => deal.stage === stage)
      .map((deal) => (
        <div
          key={deal._id}
          className="deal-card"
          draggable={stage !== "Contacted" && stage !== "Qualified"}  // Conditionally make it draggable
          onDragStart={(e) => handleDragStart(e, deal._id, deal.stage)}
        >
          <p>Deal name: {deal.leadName || deal.name}</p>
          <p>Client name: {deal.name || deal.leadName}</p>
          {stage === "Lead" && (
            <button onClick={() => handleScheduleMeeting(deal._id, deal.leadName)}>
              Schedule Meeting
            </button>
          )}
          {stage === "Contacted" && (
            <button onClick={() => handleRedirectToQuotes(deal)}>
              Send Quotation
            </button>
          )}
          {stage === "Proposal" && quotationClients[deal.leadName] && (
            <>
              <p>Total Amount: ₹{quotationClients[deal.leadName].toFixed(2)}</p>
            </>
          )}
          {stage === "Qualified" && deal.amount !== undefined && (
  <>
    <p>Qualified Amount: ₹{deal.amount.toFixed(2)}</p>
    <button onClick={() => handleArchive(deal._id)}>Archive</button>
  </>
)}

        </div>
      ))}
  </div>
))}

</div>


      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Schedule a Meeting</h3>
            <label>Date:</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <label>End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <label>Message:</label>
            <textarea
              value={meetingNote}
              onChange={(e) => setMeetingNote(e.target.value)}
              rows="3"
            />
            <button onClick={submitMeeting}>Submit</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Recycle Bin Section */}
      <div className="recycle-bin">
        <h3>Recycle Bin</h3>
        {deals
          .filter((deal) => deal.stage === "Archived")
          .map((archivedDeal) => (
            <div key={archivedDeal._id} className="archived-deal-card">
              <p>Deal name: {archivedDeal.leadName || archivedDeal.name}</p>
              <p>Client name: {archivedDeal.name || archivedDeal.leadName}</p>
              <button onClick={() => handleRestore(archivedDeal._id)}>Restore</button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Deals;
