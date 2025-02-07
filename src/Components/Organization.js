import React, { useState, useEffect } from "react";
import "./Organization.css";

const Organization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    type: "",
    date: "",
    customer: "",
    balance: "",
    total: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = "https://crm-mu-sooty.vercel.app/api/organizations";

  // Fetch organizations from the API
  const fetchOrganizations = async () => {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.success) {
      setOrganizations(data.organizations);
      setFilteredOrganizations(data.organizations); // Initialize filtered list
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Filter organizations based on the search term
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

  // Handle adding new organization
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });
    const data = await response.json();
    if (data.success) {
      alert("Organization added successfully!");
      fetchOrganizations();
      setShowAddModal(false);
      setFormValues({
        name: "",
        type: "",
        date: "",
        customer: "",
        balance: "",
        total: "",
        status: "",
      });
    } else {
      alert("Failed to add organization!");
    }
  };

  // Handle editing an organization
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${apiUrl}/${editingOrganization._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });
    const data = await response.json();
    if (data.success) {
      alert("Organization updated successfully!");
      fetchOrganizations();
      setShowEditModal(false);
      setEditingOrganization(null);
    } else {
      alert("Failed to update organization!");
    }
  };

  // Handle deleting an organization
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("Organization deleted successfully!");
        fetchOrganizations();
      } else {
        alert("Failed to delete organization!");
      }
    }
  };

  // Open the edit modal
  const openEditModal = (organization) => {
    setEditingOrganization(organization);
    setFormValues({ ...organization });
    setShowEditModal(true);
  };

  return (
    <div className="app">
      <div className="table-container">
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <button
            className="header_button"
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{marginLeft: '0%'}}
          >
            Add Organization +
          </button>
        </div>
        <table id="organizationTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Balance</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.length === 0 ? (
              <tr>
                <td colSpan="9">No organizations available.</td>
              </tr>
            ) : (
              filteredOrganizations.map((org, index) => (
                <tr key={org._id || `${org.name}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{org.name}</td>
                  <td>{org.type}</td>
                  <td>{org.date}</td>
                  <td>{org.customer}</td>
                  <td>{org.balance}</td>
                  <td>{org.total}</td>
                  <td>{org.status}</td>
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

      {/* Add and Edit Modals */}
      {showAddModal && (
        <div className="modal">
          {/* Add Modal Content */}
        </div>
      )}
      {showEditModal && (
        <div className="modal">
          {/* Edit Modal Content */}
        </div>
      )}
    </div>
  );
};

export default Organization;
