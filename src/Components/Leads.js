/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Leads.css";

function Leads() {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [showNewDealModal, setShowNewDealModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const [formData, setFormData] = useState({
        leadName: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        dealStatus: "disconnected",
        message: "",
        date: new Date().toISOString().substring(0, 10), // Default to today
    });

    

    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const newLeadsApiUrl = "http://localhost:5001/api/NewLeads";
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        filterLeads();
    }, [searchTerm, locationFilter, leads]);


    const fetchLeads = async () => {
        try {
            const response = await fetch(newLeadsApiUrl);
            const data = await response.json();
            if (data.success) {
                setLeads(data.contacts);
                setFilteredLeads(data.contacts);
            } else {
                alert("Failed to fetch leads!");
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const filterLeads = () => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const lowercasedLocationFilter = locationFilter.toLowerCase();
        const filtered = leads.filter((lead) => {
            const matchesName = lead.name.toLowerCase().includes(lowercasedSearchTerm);
            const matchesLocation = lowercasedLocationFilter
                ? lead.address.toLowerCase().includes(lowercasedLocationFilter)
                : true;
            return matchesName && matchesLocation;
        });
        setFilteredLeads(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleLocationFilterChange = (e) => {
        setLocationFilter(e.target.value); // Update location filter
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addNewLead = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(newLeadsApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                alert("New lead added successfully!");
                fetchLeads();
                setShowNewDealModal(false);
                resetFormData();
            } else {
                alert("Failed to add new lead!");
            }
        } catch (error) {
            console.error("Error adding new lead:", error);
        }
    };


    const confirmToggleStatus = (lead) => {
        setSelectedLead(lead);
        setShowConfirmModal(true);
    };

    const toggleDealStatus = async () => {
        if (!selectedLead) return;
        const updatedStatus = selectedLead.dealStatus === "connected" ? "disconnected" : "connected";
        try {
            await fetch(`${newLeadsApiUrl}/${selectedLead._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dealStatus: updatedStatus }),
            });
            fetchLeads();
        } catch (error) {
            console.error("Error updating deal status!", error);
        }
        setShowConfirmModal(false);
    };

    const resetFormData = () => {
        setFormData({
            leadName: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            dealStatus: "disconnected",
            message: "",
            date: new Date().toISOString().substring(0, 10),
        });
    };

    const handleEdit = (lead) => {
        // Set the formData to the lead's current values to allow editing.
        setFormData({
            leadName: lead.leadName,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            address: lead.address,
            dealStatus: lead.dealStatus,
            message: lead.message || "",
            _id: lead._id, // Make sure to store the lead's ID to identify the specific lead being edited
        });
        setShowNewDealModal(true); // Open the modal to allow editing.
    };
    
    const handleDelete = async (id) => {
        // Ask for confirmation or directly proceed to delete.
        const confirmation = window.confirm("Are you sure you want to delete this lead?");
        if (confirmation) {
            try {
                await fetch(`${newLeadsApiUrl}/${id}`, {
                    method: "DELETE",
                });
                fetchLeads(); // Reload the leads after deletion.
            } catch (error) {
                console.error("Error deleting lead", error);
            }
        }
    };

    const updateLead = async (e) => {
        e.preventDefault(); // Prevent the default form submission.
    
        // Send a PUT request to update the lead.
        try {
            const response = await fetch(`${newLeadsApiUrl}/${formData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // Sending the updated lead data
            });
    
            const data = await response.json();
    
            if (data.success) {
                alert("Lead updated successfully!");
                fetchLeads(); // Reload the leads after update.
                setShowNewDealModal(false); // Close the modal.
                resetFormData(); // Reset the form after updating.
            } else {
                alert("Failed to update lead!");
            }
        } catch (error) {
            console.error("Error updating lead", error);
        }
    };
    
    

    return (
        <div className="app-container">
            <main className="table-container">
                <header>
                    <h1>Leads</h1>
                    <div className="header-actions">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by Client name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="filter-container">
                            <input
                                type="text"
                                placeholder="Filter by location..."
                                value={locationFilter}
                                onChange={handleLocationFilterChange}
                            />
                        </div>
                        <button
                            className="header_button"
                            onClick={() => {
                                resetFormData();
                                setShowNewDealModal(true);
                            }}
                            style={{ marginLeft: "0%" }}
                        >
                            Add New Deal +
                        </button>
                    </div>
                </header>
                <table className="contacts-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Client Name</th>
                            <th>Deal Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Message</th>
                            <th>Action</th>
                            <th>Connect Deal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead, index) => (
                            <tr key={lead._id}>
                                <td>{index + 1}</td>
                                <td>
  {(lead.date || "").toString().substring(0,10) || "N/A"}
</td>

                                <td>{lead.leadName}</td>
                                <td>{lead.name}</td>
                                <td>{lead.email}</td>
                                <td>{lead.phone}</td>
                                <td>{lead.address}</td>
                                <td style={{fontSize:"12px"}}>{lead.message || "N/A"}</td>
                                <td>
                                    <button  style={{padding:"none"}} onClick={() => handleEdit(lead)}>Edit</button>
                                    <button onClick={() => handleDelete(lead._id)}>Delete</button>
                                </td>
                                <td>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={lead.dealStatus === "connected"}
                                            onChange={() => confirmToggleStatus(lead)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <span style={{ marginLeft: "5%", fontSize: "12px" }}>
                                        {lead.dealStatus === "connected" ? "Connected" : "Disconnected"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showNewDealModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <button className="close-btn" onClick={() => setShowNewDealModal(false)}>×</button>
                            <h2>{formData._id ? "Edit Deal" : "Add New Deal"}</h2>
                            <form onSubmit={formData._id ? updateLead : addNewLead}>
                                <input type="text" name="leadName" placeholder="Lead Name" value={formData.leadName} onChange={handleInputChange} required />
                                <input type="text" name="name" placeholder="Client Name" value={formData.name} onChange={handleInputChange} required />
                                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
                                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required />
                                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                                <textarea name="message" placeholder="Add a message" value={formData.message} onChange={handleInputChange} required></textarea>
                                <button type="submit">{formData._id ? "Update Deal" : "Add Deal"}</button>
                            </form>
                        </div>
                    </div>
                )}

                {showConfirmModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Confirm Action</h2>
                            <p>Are you sure you want to {selectedLead.dealStatus === "connected" ? "disconnect" : "connect"} this deal?</p>
                            <button onClick={toggleDealStatus}>Yes</button>
                            <button onClick={() => setShowConfirmModal(false)}>No</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Leads;