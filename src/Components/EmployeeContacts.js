import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeContacts.css";

function EmployeeContacts() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [formData, setFormData] = useState({
        empId: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        position: "",
        dateOfJoining: "",
        dateOfBirth: "",
        salary: "",
        manager: "",
        status: "active",
        message: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false); // Added missing state
    const navigate = useNavigate();

    const apiUrl = "https://crm-mu-sooty.vercel.app/api/employees";

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [searchTerm, selectedPosition, employees]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.success) {
                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } else {
                showPopupMessage("Failed to fetch employees!");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            showPopupMessage("An error occurred while fetching employees.");
        }
    };

    const filterEmployees = () => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = employees.filter((employee) => {
            const matchesSearch = employee.name.toLowerCase().includes(lowercasedSearchTerm);
            const matchesPosition =
                selectedPosition === "" || employee.position === selectedPosition;
            return matchesSearch && matchesPosition;
        });
        setFilteredEmployees(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePositionChange = (e) => {
        setSelectedPosition(e.target.value);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addEmployee = async (e) => {
        e.preventDefault();

        console.log("Adding employee with data:", formData);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Backend response:", data);

            if (data.success) {
                showPopupMessage("Employee added successfully!");
                fetchEmployees();
                setShowModal(false);
                resetFormData();
            } else {
                showPopupMessage(data.message || "Failed to add employee!");
            }
        } catch (error) {
            console.error("Error adding employee:", error);
            showPopupMessage("An error occurred while adding the employee.");
        }
    };

    const updateEmployee = async (e) => {
        e.preventDefault();
        console.log("Updating employee with data:", formData);

        try {
            const response = await fetch(`${apiUrl}/${formData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Backend response:", data);

            if (data.success) {
                showPopupMessage("Employee updated successfully!");
                fetchEmployees();
                setShowModal(false);
                resetFormData();
            } else {
                showPopupMessage(data.message || "Failed to update employee!");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            showPopupMessage("An error occurred while updating the employee.");
        }
    };

    const deleteEmployee = async (id) => {
        setConfirmMessage("Are you sure you want to delete this employee?");
        setConfirmAction(() => () => confirmDelete(id));
        setShowConfirm(true);
    };

    const confirmDelete = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (data.success) {
                showPopupMessage("Employee deleted successfully!");
                fetchEmployees();
            } else {
                showPopupMessage("Failed to delete employee!");
            }
            setShowConfirm(false);
        } catch (error) {
            console.error("Error deleting employee:", error);
            showPopupMessage("An error occurred while deleting the employee.");
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            _id: employee._id,
            empId: employee.empId,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            address: employee.address,
            department: employee.department,
            position: employee.position,
            dateOfJoining: employee.dateOfJoining,
            dateOfBirth: employee.dateOfBirth,
            salary: employee.salary,
            manager: employee.manager,
            status: employee.status,
            message: employee.message,
        });
        setShowModal(true);
    };

    const resetFormData = () => {
        setFormData({
            empId: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            department: "",
            position: "",
            dateOfJoining: "",
            dateOfBirth: "",
            salary: "",
            manager: "",
            status: "active",
            message: "",
        });
    };

    const showPopupMessage = (message) => {
        setPopupMessage(message);
        setShowPopup(true);

        setTimeout(() => {
            setShowPopup(false);
        }, 3000);
    };

    const handleRefresh = () => {
        if (!isRefreshing) {
            setIsRefreshing(true);
            fetchEmployees();

            setTimeout(() => {
                setIsRefreshing(false);
            }, 5001);
        }
    };

    return (
        <div>
            <header>
                <h1>Employee Contacts</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <select
                        value={selectedPosition}
                        onChange={handlePositionChange}
                        className="position-filter"
                    >
                        <option value="">All Positions</option>
                        {Array.from(new Set(employees.map((e) => e.position))).map((position) => (
                            <option key={position} value={position}>
                                {position}
                            </option>
                        ))}
                    </select>


                    <button onClick={() => setShowModal(true)}>Add Employee +</button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{
                            fontSize: "16px",
                            cursor: isRefreshing ? "not-allowed" : "pointer",
                            backgroundColor: isRefreshing ? "transparent" : "transparent",  // Transparent when not refreshing
                            color: isRefreshing ? "#1e1f3b" : "#1e1f3b",
                            borderRadius: "5px",
                            transition: "background-color 0.3s ease, color 0.3s ease",
                        }}
                    >
                        {isRefreshing ? (
                            "Refreshing..."
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="224" height="24" viewBox="0 0 50 50">
                                <path d="M 20 4 C 14.507813 4 10 8.507813 10 14 L 10 31.75 L 7.125 28.875 L 4.3125 31.71875 L 12 39.40625 L 19.6875 31.71875 L 16.875 28.90625 L 14 31.75 L 14 14 C 14 10.691406 16.691406 8 20 8 L 31 8 L 31 4 Z M 38 10.59375 L 30.28125 18.3125 L 33.125 21.125 L 36 18.25 L 36 36 C 36 39.308594 33.308594 42 30 42 L 19 42 L 19 46 L 30 46 C 35.492188 46 40 41.492188 40 36 L 40 18.25 L 42.875 21.125 L 45.6875 18.28125 Z"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            <table className="employee-table" style={{ maxWidth: "100%" }}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.map((employee, index) => (
                        <tr key={employee._id}>
                            <td>{index + 1}</td>
                            <td>{employee.empId}</td>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.phone}</td>
                            <td>{employee.department}</td>
                            <td>{employee.position}</td>
                            <td>
                                <a style={{ padding: "1px", marginRight: "2px" }} onClick={() => handleEdit(employee)}>✏</a>
                                <a style={{ padding: "1px" }} onClick={() => deleteEmployee(employee._id)}>🗑</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{formData._id ? "Edit Employee" : "Add Employee"}</h2>
                        <form onSubmit={formData._id ? updateEmployee : addEmployee}>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="empId"
                                    placeholder="Employee ID"
                                    value={formData.empId}
                                    onChange={handleInputChange}
                                    required
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
                                    name="department"
                                    placeholder="Department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="position"
                                    placeholder="Position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    required
                                />
                                <input
                                    type="date"
                                    name="dateOfJoining"
                                    value={formData.dateOfJoining}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="number"
                                    name="salary"
                                    placeholder="Salary"
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="subdiv">
                                <input
                                    type="text"
                                    name="manager"
                                    placeholder="Manager"
                                    value={formData.manager}
                                    onChange={handleInputChange}
                                />
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <textarea
                                name="message"
                                placeholder="Additional Notes"
                                value={formData.message}
                                onChange={handleInputChange}
                            ></textarea>
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showPopup && <div className="popup">{popupMessage}</div>}

            {showConfirm && (
                <div className="confirmation-popup">
                    <p>{confirmMessage}</p>
                    <button onClick={confirmAction}>Yes</button>
                    <button onClick={() => setShowConfirm(false)}>No</button>
                </div>
            )}
        </div>
    );
}

export default EmployeeContacts;