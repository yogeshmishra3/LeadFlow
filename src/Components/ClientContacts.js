import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeContacts.css";

function ClientContacts() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [formData, setFormData] = useState({
        clientId: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        companyname: "",
        status: "Active",
        dob: "",
        city: "",
        industry: "",
        note: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditMode, setIsEditMode] = useState(false); // To check if we are editing a client
    const [editClientId, setEditClientId] = useState(null); // To store the clientId of the client to edit
    const navigate = useNavigate();

    const apiUrl = "https://crm-mu-sooty.vercel.app/api/clientDetail";

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        filterClients();
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.success) {
                setClients(data.clients);
                setFilteredClients(data.clients);
            } else {
                showPopupMessage("Failed to fetch clients!");
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            showPopupMessage("An error occurred while fetching clients.");
        }
    };

    const filterClients = () => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = clients.filter((client) =>
            client.name.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredClients(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addClient = async (e) => {
        e.preventDefault();

        console.log("Form data before sending:", formData); // Check the data

        // Make sure clientId is not empty or null
        if (!formData.clientId) {
            showPopupMessage("Client ID is required!");
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showPopupMessage("Client added successfully!");
                fetchClients();
                setShowModal(false);
                resetFormData();
            } else {
                showPopupMessage(data.message || "Failed to add client!");
            }
        } catch (error) {
            console.error("Error adding client:", error);
            showPopupMessage("An error occurred while adding the client.");
        }
    };




    const editClient = async (clientId) => {
        try {
            const response = await fetch(`${apiUrl}/${clientId}`);
            const data = await response.json();

            if (data.success) {
                setFormData(data.client);
                setShowModal(true);
                setIsEditMode(true);
                setEditClientId(clientId); // Set the clientId for editing
            } else {
                showPopupMessage("Error fetching client details.");
            }
        } catch (error) {
            console.error("Error fetching client details:", error);
            showPopupMessage("An error occurred while fetching client details.");
        }
    };


    const deleteClient = async (clientId) => {
        // Show confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete this client?");

        // If the user clicked "OK", proceed with the delete action
        if (isConfirmed) {
            try {
                const response = await fetch(`${apiUrl}/${clientId}`, {
                    method: "DELETE",
                });

                const data = await response.json();

                if (data.success) {
                    showPopupMessage("Client deleted successfully!");
                    fetchClients(); // Refresh the client list
                } else {
                    showPopupMessage("Failed to delete client!");
                }
            } catch (error) {
                console.error("Error deleting client:", error);
                showPopupMessage("An error occurred while deleting the client.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };


    const resetFormData = () => {
        setFormData({
            clientId: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            companyname: "",
            status: "Active",
            dob: "",
            city: "",
            industry: "",
            note: "",
        });
    };

    const showPopupMessage = (message) => {
        setPopupMessage(message);
        setShowPopup(true);

        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    const saveClient = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${apiUrl}/${editClientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                showPopupMessage("Client updated successfully!");
                fetchClients();
                setShowModal(false);
                resetFormData();
            } else {
                showPopupMessage("Failed to update client!");
            }
        } catch (error) {
            console.error("Error updating client:", error);
            showPopupMessage("An error occurred while updating the client.");
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>Client Contacts</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button onClick={() => { setShowModal(true); setIsEditMode(false); }}>Add Client +</button>
                </div>
            </header>

            <table className="employee-table" style={{ maxWidth: "100%" }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Client ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Company Name</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClients.map((client, index) => (
                        <tr key={client._id}>
                            <td>{index + 1}</td>
                            <td>{client.clientId}</td>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.phone}</td>
                            <td>{client.address}</td>
                            <td>{client.companyname}</td>
                            <td>{client.status}</td>
                            <td>
                                <button onClick={() => editClient(client._id)}>Edit</button>
                                <button onClick={() => deleteClient(client._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isEditMode ? "Edit Client" : "Add Client"}</h2>
                        <form onSubmit={isEditMode ? saveClient : addClient}>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="clientId"
                                    placeholder="Client ID"
                                    value={formData.clientId}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditMode}
                                />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="companyname"
                                    placeholder="Company Name"
                                    value={formData.companyname}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="dob"
                                    placeholder="(In Date) DD/MM/YYYY"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    required
                                    pattern="\d{2}/\d{2}/\d{4}"
                                    title="Please enter the date in DD/MM/YYYY format."
                                />

                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="industry"
                                    placeholder="Industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    required
                                />
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <textarea
                                name="note"
                                placeholder="Additional Notes"
                                value={formData.note}
                                onChange={handleInputChange}
                            ></textarea>
                            <button type="submit">{isEditMode ? "Save Changes" : "Save"}</button>
                            <button type="button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showPopup && <div className="popup">{popupMessage}</div>}
        </div>
    );
}

export default ClientContacts;
