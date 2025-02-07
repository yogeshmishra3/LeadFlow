import React, { useState, useEffect } from 'react';
import './Contacts.css';
const apiUrl = "https://crm-mu-sooty.vercel.app/api/Leads";

const Contacts = () => {
    const [leads, setLeads] = useState([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentLead, setCurrentLead] = useState(null);
    
      // Fetch leads from the API
      useEffect(() => {
        fetchLeads();
      }, []);
    
      const fetchLeads = async () => {
        try {
          const response = await fetch(apiUrl);
          console.log("Response Status: ", response.status); // Log the status code
          const data = await response.json();
          console.log("Response Data: ", data); // Log the response data
    
          // Change from 'data.projects' to 'data.Leads'
          if (data.success && Array.isArray(data.Leads)) {
            setLeads(data.Leads);
          } else {
            console.error("Failed to fetch leads or invalid data format:", data.message || data);
            setLeads([]);
          }
        } catch (error) {
          console.error("Error fetching leads:", error);
          setLeads([]);
        }
      };
    
    
      const handleOpenModal = (lead = null) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
      };
    
      const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLead(null);
      };
    
      const handleSaveLead = async (e) => {
        e.preventDefault();
        const { name, date, team, status } = e.target.elements;
        const payload = {
          name: name.value.trim(),
          date: date.value.trim(),
          team: team.value.trim(),
          status: status.value.trim(),
        };
    
        try {
          const response = await fetch(
            currentLead ? `${apiUrl}/${currentLead._id}` : apiUrl,
            {
              method: currentLead ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          const data = await response.json();
          console.log("Save Lead Response Data:", data); // Log the response of saving lead
          if (data.success) {
            alert(`Lead ${currentLead ? "updated" : "added"} successfully!`);
            fetchLeads();
            handleCloseModal();
          } else {
            alert(`Failed to save lead: ${data.message}`);
          }
        } catch (error) {
          console.error("Error saving lead:", error);
        }
      };
    
      const handleDeleteLead = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        try {
          const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
          const data = await response.json();
          console.log("Delete Lead Response Data:", data); // Log the response of deleting lead
          if (data.success) {
            alert("Lead deleted successfully!");
            fetchLeads();
          } else {
            alert("Failed to delete lead: " + data.message);
          }
        } catch (error) {
          console.error("Error deleting lead:", error);
        }
      };
    
      return (
        <div className="app">
          <div className="table-containerr">
            <header>
              <h1>Leads</h1>
            </header>
            <button className="headerrr_button" type="button" onClick={() => handleOpenModal()}>
              Add Leads +
            </button>
            <table id="projectsTable" style={{width: '200%'}}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Joining Date</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead, index) => (
                    <tr key={lead._id}>
                      <td>{index + 1}</td>
                      <td>{lead.name}</td>
                      <td>{lead.date}</td>
                      <td>{lead.team}</td>
                      <td>{lead.status}</td>
                      <td>
                        <button onClick={() => handleOpenModal(lead)}>Edit</button>
                        <button onClick={() => handleDeleteLead(lead._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No leads available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
    
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <button className="hi" onClick={handleCloseModal}>×</button>
                <h2>{currentLead ? "Edit Lead" : "Add Lead"}</h2>
                <form onSubmit={handleSaveLead}>
                  <input
                    type="text"
                    name="name"
                    defaultValue={currentLead?.name || ""}
                    required
                  />
                  <input
                    name="date"
                    type="date"
                    defaultValue={currentLead?.date || ""}
                    required
                  />
                  <input
                    type="text"
                    name="team"
                    defaultValue={currentLead?.team || ""}
                    required
                  />
                  <select
                    type="text"
                    name="status"
                    defaultValue={currentLead?.status || ""}
                    required
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button  type="submit">Save Lead</button>
                </form>
    
              </div>
            </div>
          )}
        </div>
      );
    }

export default Contacts;
