import React, { useEffect, useState } from "react";
import "./Organization.css";
import "./OrganizationsInCards.css"

const Organizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOrganization, setEditingOrganization] = useState(null);
    const [formValues, setFormValues] = useState({
        name: "",
        products: 0, // Default to 0 for numeric fields
        balance: 0,  // Default to 0 for numeric fields
    });
    
    const [searchTerm, setSearchTerm] = useState("");

    const apiUrl = "https://crm-mu-sooty.vercel.app/api/organizations";

    // Fetch organizations from the API
    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.success) {
                setOrganizations(data.organizations);
                setFilteredOrganizations(data.organizations);
            } else {
                alert("Failed to fetch organizations.");
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
            alert("Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = organizations.filter((org) =>
            org.name.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredOrganizations(filtered);
    }, [searchTerm, organizations]);

    // Handle input field changes
    const handleInputChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle adding a new organization
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting organization:", formValues);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formValues),
            });
            const data = await response.json();
            console.log("Server Response:", data);

            if (data.success) {
                alert("Organization added successfully!");
                fetchOrganizations();
                setShowAddModal(false);
                setFormValues({ name: "", products: "", balance: "" });
            } else {
                alert(`Failed to add organization: ${ data.message || "Unknown error" }`);
            }
        } catch (error) {
            console.error("Error adding organization:", error);
            alert("An error occurred while adding the organization.");
        }
    };

    // Handle editing an organization
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        console.log("Updating organization:", editingOrganization, formValues);

        try {
            const response = await fetch(`${apiUrl}/${editingOrganization._id }`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formValues),
            });
            const data = await response.json();
            console.log("Edit Server Response:", data);

            if (data.success) {
                alert("Organization updated successfully!");
                fetchOrganizations();
                setShowEditModal(false);
                setEditingOrganization(null);
            } else {
                alert("Failed to update organization!");
            }
        } catch (error) {
            console.error("Error updating organization:", error);
        }
    };

    // Handle deleting an organization
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this organization?")) {
            try {
                const response = await fetch(`${ apiUrl }/${ id }`, {
                    method: "DELETE",
                });
                const data = await response.json();
                console.log("Delete Server Response:", data);

                if (data.success) {
                    alert("Organization deleted successfully!");
                    fetchOrganizations();
                } else {
                    alert("Failed to delete organization!");
                }
            } catch (error) {
                console.error("Error deleting organization:", error);
            }
        }
    };

    // Open the edit modal
    const openEditModal = (organization) => {
        setEditingOrganization(organization);
        setFormValues({ ...organization });
        setShowEditModal(true);
    };

    // Utility function to generate colors for organization initials
    const getColor = (name) => {
        const colors = ["#CDE4FF", "#FFE4C7", "#FFD6E0", "#D4FFC1", "#E6D9FF"];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="organizations-container" style={{ padding: "20px", marginTop: "3%", marginLeft:'16%' }}>
            <h1>Organizations</h1>
            <header className="organizations-header">
                
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                    style={{marginRight:'1%'}}
                />
                <button onClick={() => setShowAddModal(true)} className="addButton">
                    + Add Organization
                </button>
            </header>

            <div className="card-grid">
                {loading ? (
                    <p>Loading organizations...</p>
                ) : filteredOrganizations.length > 0 ? (
                    filteredOrganizations.map((org, index) => (
                        <div className="organization-card" key={org._id || index}>
                            <div className="profileName">
                                <div
                                    className="organization-initial"
                                    style={{ backgroundColor: getColor(org.name) }}
                                >
                                    {org.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="profileName">
                                    <h3>{org.name}</h3>
                                </div>
                            </div>
                            <div className="organization-details">
                                <p>
                                    <strong>Products:</strong> {org.products || 0}
                                </p>
                                <p>
                                    <strong>Balance:</strong> ${org.balance ? org.balance.toLocaleString() : "0.00"}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No organizations available.</p>
                )}
            </div>

            <button onClick={() => setShowTable(!showTable)} className="tableButton">
                {showTable ? "Hide Table Format" : "See in Table Format"}
            </button>

            {showTable && (
                <div className="table-container" style={{width:'86.5%'}}>
                    <table id="organizationTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Products</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrganizations.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No organizations available.</td>
                                </tr>
                            ) : (
                                filteredOrganizations.map((org, index) => (
                                    <tr key={`org._id || ${org.name}- ${ index }`}>
                            <td>{index + 1}</td>
                            <td>{org.name}</td>
                            <td>{org.products}</td>
                            <td>${org.balance}</td>
                            <td>
                                <button
                                    className="action-btn edit"
                                    onClick={() => openEditModal(org)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(org._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                        ))
              )}
                    </tbody>
                </table>
        </div>
    )
}

{
    showAddModal && (
        <div className="modal">
            <div className="modal-content">
                <h2>Add Organization</h2>
                <form onSubmit={handleAddSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formValues.name}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Products:
                        <input
                            type="number"
                            name="products"
                            value={formValues.products}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Balance:
                        <input
                            type="number"
                            name="balance"
                            value={formValues.balance}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <button type="submit">Add</button>
                    <button type="button" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}

{
    showEditModal && (
        <div className="modal">
            <div className="modal-content">
                <h2>Edit Organization</h2>
                <form onSubmit={handleEditSubmit}>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formValues.name}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Products:
                        <input
                            type="number"
                            name="products"
                            value={formValues.products}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Balance:
                        <input
                            type="number"
                            name="balance"
                            value={formValues.balance}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <button type="submit">Update</button>
                    <button type="button" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}
    </div >
  );
};

export default Organizations;