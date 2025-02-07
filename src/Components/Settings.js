import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeContacts from "./EmployeeContacts";

// API URLs for integrations, deals, and quotations
const integrationsApiUrl = "https://crm-mu-sooty.vercel.app/api/integrations";
const dealManagementApiUrl = "https://crm-mu-sooty.vercel.app/api/dealmanagement";
const quotationsApiUrl = "https://crm-mu-sooty.vercel.app/api/newquotations";

function Settings() {
    const [deals, setDeals] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [integrations, setIntegrations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [providerName, setProviderName] = useState("");
    const [serviceInputs, setServiceInputs] = useState([]);
    const [editingIntegration, setEditingIntegration] = useState(null);
    const [editingServiceIndex, setEditingServiceIndex] = useState(null);
    const [activeSection, setActiveSection] = useState("deals");
    const navigate = useNavigate();

    // Fetch data when the component mounts
    useEffect(() => {
        fetchDeals();
        fetchQuotations();
        fetchIntegrations();
    }, []);

    // Fetch Deals
    const fetchDeals = async () => {
        try {
            const response = await fetch(dealManagementApiUrl);
            if (!response.ok) throw new Error("Failed to fetch deals");
            const data = await response.json();
            setDeals(data);
        } catch (error) {
            console.error("Error fetching deals:", error);
        }
    };

    // Fetch Quotations
    const fetchQuotations = async () => {
        try {
            const response = await fetch(quotationsApiUrl);
            if (!response.ok) throw new Error("Failed to fetch quotations");
            const data = await response.json();
            setQuotations(data);
        } catch (error) {
            console.error("Error fetching quotations:", error);
        }
    };

    // Fetch Integrations
    const fetchIntegrations = async () => {
        try {
            const response = await fetch(integrationsApiUrl);
            if (!response.ok) throw new Error("Failed to fetch integrations");
            const data = await response.json();
            console.log("Fetched integrations response:", data);
            if (Array.isArray(data.data)) {
                setIntegrations(data.data);
            } else {
                console.error("Expected an array of integrations in 'data', but received:", data.data);
                setIntegrations([]);
            }
        } catch (error) {
            console.error("Error fetching integrations:", error);
            setIntegrations([]);
        }
    };

    // Delete Deal
    const handleDeleteDeal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this deal?")) return;
        try {
            const response = await fetch(`${dealManagementApiUrl}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete deal");
            setDeals(deals.filter((deal) => deal._id !== id));
        } catch (error) {
            console.error("Error deleting deal:", error);
        }
    };

    // Edit Quotation
    const handleEditQuotation = (id) => {
        navigate(`/edit-quotation/${id}`);
    };

    // Delete Quotation
    const handleDeleteQuotation = async (id) => {
        if (!window.confirm("Are you sure you want to delete this quotation?")) return;
        try {
            const response = await fetch(`${quotationsApiUrl}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete quotation");
            setQuotations(quotations.filter((quotation) => quotation._id !== id));
        } catch (error) {
            console.error("Error deleting quotation:", error);
        }
    };

    // Delete Service
    const handleDeleteService = async (integrationId, serviceId) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;

        const integration = integrations.find((i) => i._id === integrationId);
        if (!integration) {
            console.error("Integration not found");
            return;
        }

        const updatedServices = integration.services.filter((service) => service._id !== serviceId);
        const updatedIntegration = {
            ...integration,
            services: updatedServices,
        };

        try {
            const response = await fetch(`${integrationsApiUrl}/${integrationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedIntegration),
            });

            if (!response.ok) throw new Error("Failed to delete service");

            setIntegrations(
                integrations.map((integration) =>
                    integration._id === integrationId ? updatedIntegration : integration
                )
            );

            alert("Service deleted successfully");
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Error deleting service. Please try again.");
        }
    };

    // Delete Integration
    const handleDeleteIntegration = async (id) => {
        if (!window.confirm("Are you sure you want to delete this integration?")) return;
        try {
            const response = await fetch(`${integrationsApiUrl}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete integration");
            setIntegrations(integrations.filter((integration) => integration._id !== id));
        } catch (error) {
            console.error("Error deleting integration:", error);
        }
    };

    // Edit Service
    const handleEditService = (integrationId, serviceIndex) => {
        const integration = integrations.find((i) => i._id === integrationId);
        setProviderName(integration.provider);
        setServiceInputs(
            integration.services.map((service) => ({
                name: service.name,
                dueDate: service.dueDate,
            }))
        );
        setEditingIntegration(integration);
        setEditingServiceIndex(serviceIndex);
        setShowModal(true);
    };

    // Save Services after editing
    const handleSaveServices = async () => {
        try {
            const updatedIntegration = {
                ...editingIntegration,
                provider: providerName,
                services: serviceInputs.map((input) => ({
                    name: input.name,
                    dueDate: input.dueDate,
                })),
            };

            const response = await fetch(`${integrationsApiUrl}/${editingIntegration._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedIntegration),
            });

            if (!response.ok) throw new Error("Failed to update integration");

            setIntegrations(
                integrations.map((integration) =>
                    integration._id === updatedIntegration._id ? updatedIntegration : integration
                )
            );

            setShowModal(false);
            setProviderName("");
            setServiceInputs([]);
            setEditingIntegration(null);
            setEditingServiceIndex(null);
        } catch (error) {
            console.error("Error saving services:", error);
        }
    };

    // Handle change for service input fields
    const handleServiceChange = (index, field, value) => {
        const updatedInputs = [...serviceInputs];
        updatedInputs[index][field] = value;
        setServiceInputs(updatedInputs);
    };

    // Sidebar Navigation
    const handleSidebarNavigation = (section) => {
        setActiveSection(section);
    };

    return (
        <div style={{ display: "flex" }}>
            {/* Main Content Area */}
            <div style={{ marginLeft: "17%", width: "65%" }}>
                <h2>Settings</h2>

                {/* Deals Section */}
                {activeSection === "deals" && (
                    <>
                        <h3>Deals</h3>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Lead Name</th>
                                    <th>Stage</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals.map((deal) => (
                                    <tr key={deal._id}>
                                        <td>{deal.name}</td>
                                        <td>{deal.leadName}</td>
                                        <td>{deal.stage}</td>
                                        <td>₹{deal.amount}</td>
                                        <td>
                                            <button onClick={() => handleDeleteDeal(deal._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Quotations Section */}
                {activeSection === "quotations" && (
                    <>
                        <h3>Quotations</h3>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Deal Name</th>
                                    <th>Client Name</th>
                                    <th>Quotation No</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.map((quotation) => (
                                    <tr key={quotation._id}>
                                        <td>{quotation.dealName}</td>
                                        <td>{quotation.clientName}</td>
                                        <td>{quotation.quotationNo}</td>
                                        <td>{quotation.date}</td>
                                        <td>
                                            ₹
                                            {quotation.items.reduce(
                                                (sum, item) => sum + parseFloat(item.amount),
                                                0
                                            )}
                                        </td>
                                        <td>
                                            <button onClick={() => handleEditQuotation(quotation._id)}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteQuotation(quotation._id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Integrations Section */}
                {activeSection === "integrations" && (
                    <>
                        <h3>Integrations</h3>
                        {integrations.length === 0 ? (
                            <p>No integrations available</p>
                        ) : (
                            <table border="1">
                                <thead>
                                    <tr>
                                        <th>Provider Name</th>
                                        <th>Service Count</th>
                                        <th>Actions</th>
                                        <th>Services</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {integrations.map((integration) => (
                                        <tr key={integration._id}>
                                            <td>{integration.provider}</td>
                                            <td>{integration.services.length}</td>
                                            <td>
                                                <button onClick={() => handleDeleteIntegration(integration._id)}>
                                                    Delete
                                                </button>
                                            </td>
                                            {/* Nested table for services */}
                                            <tr>
                                                <td colSpan="3">
                                                    <table
                                                        style={{
                                                            width: "100%",
                                                            borderCollapse: "collapse",
                                                            marginTop: "20px",
                                                        }}
                                                    >
                                                        <thead>
                                                            <tr style={{ backgroundColor: "#f4f4f4" }}>
                                                                <th
                                                                    style={{
                                                                        padding: "8px",
                                                                        textAlign: "left",
                                                                        border: "1px solid #ddd",
                                                                    }}
                                                                >
                                                                    Service Name
                                                                </th>
                                                                <th
                                                                    style={{
                                                                        padding: "8px",
                                                                        textAlign: "left",
                                                                        border: "1px solid #ddd",
                                                                    }}
                                                                >
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {integration.services.map((service, index) => (
                                                                <tr key={service._id} style={{ borderBottom: "1px solid #ddd" }}>
                                                                    <td style={{ padding: "8px", textAlign: "left" }}>
                                                                        {service.name}
                                                                    </td>
                                                                    <td style={{ padding: "8px" }}>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditService(integration._id, index)
                                                                            }
                                                                        >
                                                                            Edit Service
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteService(integration._id, service._id)
                                                                            }
                                                                        >
                                                                            Delete Service
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* Employee Contacts Section */}
                {activeSection === "employeeContacts" && (
                    <>
                        <EmployeeContacts />
                    </>
                )}

                {/* Modal for Editing Services */}
                {showModal && (
                    <div
                        className="modal"
                        style={{
                            display: "block",
                            position: "fixed",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            background: "rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        <div
                            className="modal-content"
                            style={{
                                backgroundColor: "#fff",
                                padding: "20px",
                                maxWidth: "600px",
                                margin: "100px auto",
                            }}
                        >
                            <h4>Edit Service</h4>
                            <label>Provider Name</label>
                            <input
                                type="text"
                                value={providerName}
                                onChange={(e) => setProviderName(e.target.value)}
                                placeholder="Provider Name"
                            />
                            {serviceInputs.map((input, index) => (
                                <div key={index}>
                                    <label>Service Name</label>
                                    <input
                                        type="text"
                                        value={input.name}
                                        onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                                        placeholder="Service Name"
                                    />
                                    <label>Due Date</label>
                                    <input
                                        type="text"
                                        value={input.dueDate}
                                        onChange={(e) => handleServiceChange(index, "dueDate", e.target.value)}
                                        placeholder="Due Date"
                                    />
                                </div>
                            ))}

                            <button onClick={handleSaveServices}>Save</button>
                            <button onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div
                style={{
                    width: "13%",
                    marginLeft: "auto",
                    padding: "20px",
                    backgroundColor: "white",
                    height: "100vh",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="Profile"
                        style={{ width: "60px", height: "60px", borderRadius: "50%", marginBottom: "10px" }}
                    />
                    <h3>Hi, Yogesh Mishra</h3>
                    <p>Admin</p>
                </div>

                <ul style={{ listStyleType: "none", padding: "0" }}>
                    <li
                        style={{
                            color: "white",
                            borderRadius: "10px",
                            marginBottom: "8px",
                            padding: "8px",
                            cursor: "pointer",
                            backgroundColor: "#5932EA",
                            fontWeight: "bold",
                        }}
                        onClick={() => handleSidebarNavigation("deals")}
                    >
                        Deals
                    </li>
                    <li
                        style={{
                            color: "white",
                            borderRadius: "10px",
                            marginBottom: "8px",
                            padding: "8px",
                            cursor: "pointer",
                            backgroundColor: "#5932EA",
                            fontWeight: "bold",
                        }}
                        onClick={() => handleSidebarNavigation("quotations")}
                    >
                        Quotations
                    </li>
                    <li
                        style={{
                            color: "white",
                            borderRadius: "10px",
                            marginBottom: "8px",
                            padding: "8px",
                            cursor: "pointer",
                            backgroundColor: "#5932EA",
                            fontWeight: "bold",
                        }}
                        onClick={() => handleSidebarNavigation("integrations")}
                    >
                        Integrations
                    </li>
                    <li
                        style={{
                            color: "white",
                            borderRadius: "10px",
                            marginBottom: "8px",
                            padding: "8px",
                            cursor: "pointer",
                            backgroundColor: "#5932EA",
                            fontWeight: "bold",
                        }}
                        onClick={() => handleSidebarNavigation("employeeContacts")}
                    >
                        Employee Contacts
                    </li>
                    
                </ul>
            </div>
        </div>
    );
}

export default Settings;