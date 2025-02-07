import React, { useState, useEffect } from "react";
import axios from "axios";
import "./int.css"; // Assuming you create a CSS file for styles

const CRMIntegrationPage = () => {
    const [services, setServices] = useState([]);
    const [providerName, setProviderName] = useState("");
    const [serviceInputs, setServiceInputs] = useState([{ name: "", dueDate: "" }]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const baseURL = "https://crm-mu-sooty.vercel.app/api/integrations";

    const fetchIntegrations = async () => {
        try {
            const response = await axios.get(baseURL);
            setServices(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations:", error.message);
            alert("Unable to fetch integrations. Please try again later.");
        }
    };

    const checkExpiringServices = (serviceData) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const expiringServices = serviceData.flatMap((provider) =>
            provider.services
                .filter(
                    (service) =>
                        service.dueDate &&
                        new Date(service.dueDate).toISOString().split("T")[0] ===
                        tomorrow.toISOString().split("T")[0]
                )
                .map((service) => ({
                    provider: provider.provider,
                    service: service.name,
                    dueDate: service.dueDate,
                }))
        );

        setNotifications(expiringServices);
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchIntegrations();
            if (data) checkExpiringServices(data);
        };
        fetchData();
    }, []);

    const handleAddServiceInput = () => {
        setServiceInputs([...serviceInputs, { name: "", dueDate: "" }]);
    };

    const handleRemoveServiceInput = (index) => {
        const updatedInputs = serviceInputs.filter((_, i) => i !== index);
        setServiceInputs(updatedInputs);
    };

    const handleServiceChange = (index, field, value) => {
        const updatedInputs = serviceInputs.map((input, i) =>
            i === index ? { ...input, [field]: value } : input
        );
        setServiceInputs(updatedInputs);
    };

    const handleSaveServices = async () => {
        if (providerName && serviceInputs.every((input) => input.name && input.dueDate)) {
            try {
                await axios.post(baseURL, {
                    provider: providerName,
                    services: serviceInputs,
                });
                const data = await fetchIntegrations();
                checkExpiringServices(data);
                setProviderName("");
                setServiceInputs([{ name: "", dueDate: "" }]);
                setShowModal(false);
            } catch (error) {
                console.error("Error saving integration:", error.message);
                alert("Failed to save integration. Please try again.");
            }
        } else {
            alert("Please fill out all fields before saving.");
        }
    };

    const handleProviderClick = (provider) => setSelectedProvider(provider);

    const handleClosePopup = () => setSelectedProvider(null);

    const generateAvatar = (name) =>
        name
            .split(" ")
            .map((part) => part[0].toUpperCase())
            .join("");

    return (
        <div className="crm-container">
            <h1>CRM Integration Page</h1>

            {notifications.length > 0 && (
                <div className="notification">
                    <h3>Expiring Services</h3>
                    {notifications.map((notification, index) => (
                        <p key={index}>
                            <strong>{notification.provider}</strong> - {notification.service} is expiring on{" "}
                            {new Date(notification.dueDate).toISOString().split("T")[0]}.
                        </p>
                    ))}
                    <button onClick={() => setNotifications([])}>Dismiss</button>
                </div>
            )}

            <button onClick={() => setShowModal(true)} className="add-service-btn">
                Add Services
            </button>

            {showModal && (
                <div className="modal-integration">
                    <h2>Add Services</h2>
                    <input
                        type="text"
                        placeholder="Provider Name"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                    />
                    {serviceInputs.map((input, index) => (
                        <div key={index} className="service-input-container">
                            <div className="inputs-group">
                                <input
                                    type="text"
                                    placeholder="Service Name"
                                    value={input.name}
                                    onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                                />
                                <input
                                    type="date"
                                    value={input.dueDate}
                                    onChange={(e) => handleServiceChange(index, "dueDate", e.target.value)}
                                />
                            </div>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveServiceInput(index)}>
                                Remove
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddServiceInput}>Add Service</button>
                    <button onClick={handleSaveServices}>Save Services</button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                </div>
            )}

            {services.length > 0 ? (
                <div className="provider-list">
                    {services.map((serviceGroup) => (
                        <div
                            key={serviceGroup._id}
                            className="provider-card"
                            onClick={() => handleProviderClick(serviceGroup)}
                        >
                            <div className="profile-icon">
                                {generateAvatar(serviceGroup.provider)}
                            </div>
                            <h3>{serviceGroup.provider}</h3>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No providers added yet.</p>
            )}

            {selectedProvider && (
                <div className="modall">
                    <h2>{selectedProvider.provider}</h2>
                    {selectedProvider.services.map((service, index) => (
                        <div key={index}>
                            <p>
                                <strong>Service:</strong> {service.name}
                            </p>
                            <p>
                                <strong>Due Date:</strong> {new Date(service.dueDate).toISOString().split("T")[0]}
                            </p>
                        </div>
                    ))}
                    <button onClick={handleClosePopup}>Close</button>
                </div>
            )}
        </div>
    );
};

export default CRMIntegrationPage;