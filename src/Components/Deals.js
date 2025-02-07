import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Deals.css";

const dealManagementApiUrl = "https://crm-mu-sooty.vercel.app/api/dealmanagement";
const newLeadsApiUrl = "https://crm-mu-sooty.vercel.app/api/NewLeads";
const meetingsApiUrl = "https://crm-mu-sooty.vercel.app/api/meetings";
const quotationsApiUrl = "https://crm-mu-sooty.vercel.app/api/newquotations";
const recycleBinApiUrl = "https://crm-mu-sooty.vercel.app/api/dealmanagement";
const recyclebinhai = "https://crm-mu-sooty.vercel.app/api/recyclebin/restore";

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
  const [archivedLeads, setArchivedLeads] = useState([]);

  const stages = ["Lead", "Contacted", "Proposal", "Qualified"];

  useEffect(() => {
    fetchAndStoreNewLeads();
    fetchInitialData();
    fetchArchivedLeads();
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

      // Sync Quotations to Deal Management API (create deals with Proposal stage)
      await syncQuotationsToDealManagement(quotationsData);

      // Check for duplicate deals and delete them from dealManagementApiUrl
      await deleteDuplicateDeals(transactionsData, quotationsData);

      // Filter out the "Proposal" deals from the transactionsData
      const filteredDeals = transactionsData.filter(deal => deal.stage !== "Proposal");

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

      // Combine the filtered transactions data (excluding "Proposal" stage) with the proposalDeals
      const updatedDeals = [...filteredDeals, ...proposalDeals];
      setDeals(updatedDeals);

      // Store total amount per client in quotationClients state
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

  const syncQuotationsToDealManagement = async (quotationsData) => {
    try {
      for (const quotation of quotationsData) {
        const { dealName, clientName, quotationNo, items } = quotation;
        const totalAmount = items.reduce(
          (sum, item) => sum + parseFloat(item.amount),
          0
        );

        const dealData = {
          leadName: dealName, // Quotation dealName to leadName
          name: clientName,   // Quotation clientName to name
          amount: totalAmount, // Total amount from the quotation
          stage: "Proposal",   // Stage set to "Proposal"
        };

        // Send the new deal to the dealmanagement API
        const response = await fetch(dealManagementApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dealData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create deal in dealmanagement:", errorData);
        } else {
          console.log(`Successfully created deal for ${dealName} - ${clientName}`);
        }
      }
    } catch (error) {
      console.error("Error syncing quotations to deal management:", error);
    }
  };

  const deleteDuplicateDeals = async (transactionsData, quotationsData) => {
    for (const quotation of quotationsData) {
      const { dealName, clientName } = quotation;

      // Find matching deals where stage is "Contacted" OR "Lead"
      const matchingDeals = transactionsData.filter(
        (deal) =>
          deal.leadName === dealName &&
          deal.name === clientName &&
          (deal.stage === "Contacted" || deal.stage === "Lead")
      );

      for (const matchingDeal of matchingDeals) {
        try {
          console.log(`Deleting duplicate deal: ${dealName} - ${clientName}`);
          const response = await fetch(`https://crm-mu-sooty.vercel.app/api/dealmanagement/${matchingDeal._id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            console.log(`Successfully deleted: ${dealName} - ${clientName}`);
          } else {
            const errorData = await response.json();
            console.error(`Failed to delete. Status: ${response.status}, errorData`);
          }
        } catch (error) {
          console.error(`Error deleting deal: ${dealName} - ${clientName}, error`);
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
          const response = await fetch(`https://crm-mu-sooty.vercel.app/api/newquotations/${dealId}`, {
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

          const newDealResponse = await fetch("https://crm-mu-sooty.vercel.app/api/dealmanagement", {
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
    if (!confirmArchive) return;

    try {
      const response = await fetch(`${dealManagementApiUrl}/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "Archived",
          moveToFolder: "DeleteLeads",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to archive deal.");
      }

      alert("Deal archived and moved to DeleteLeads folder successfully!");

      // Optimistic UI update: Remove archived deal from local state before refetching data
      setDeals((prevDeals) => prevDeals.filter((deal) => deal.id !== dealId));

      // Fetch updated data
      await Promise.all([fetchInitialData(), fetchArchivedLeads()]);
    } catch (error) {
      console.error("Error archiving deal:", error);
      alert(error.message);
    }
  };

  const fetchArchivedLeads = async () => {
    try {
      const response = await fetch(recycleBinApiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch archived leads");
      }

      const data = await response.json();
      const archivedLeads = data.filter((lead) => lead.stage === "Archived");
      setArchivedLeads(archivedLeads);
    } catch (error) {
      console.error("Error fetching archived leads:", error);
    }
  };

  const restoreDeal = async (dealId) => {
    try {
      const response = await fetch(`${recyclebinhai}/${dealId}`, { // Ensure URL matches the backend route
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to restore deal.");
      }

      const restoredDeal = await response.json();
      alert("Deal restored to 'Qualified' stage.");
      // Optionally, re-fetch the updated deal list or update UI here
    } catch (error) {
      console.error("Error restoring deal:", error);
      alert(error.message);
    }
  };


  const deleteArchivedLead = async (id) => {
    try {
      const response = await fetch(`${recycleBinApiUrl}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete archived lead.");
      }

      console.log("Archived lead deleted permanently!");

      // Optimistic UI update: Remove lead from local state
      setArchivedLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
    } catch (error) {
      console.error("Error deleting archived lead:", error);
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
        <ul>
          {archivedLeads.map((lead) => (
            <li key={lead._id}>
              <p>{lead.name} - {lead.leadName} - {lead.stage}</p>
              <button onClick={() => restoreDeal(lead._id)}>Restore</button>
              <button onClick={() => deleteArchivedLead(lead._id)}>Delete Permanently</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Deals;