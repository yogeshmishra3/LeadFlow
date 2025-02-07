import React, { useState, useEffect } from "react";

const dealsApiUrl = "http://localhost:5001/api/dealmanagement";
const projectsDetailsApiUrl = "https://crm-mu-sooty.vercel.app/api/projectsDetails"; // Correct URL for your backend
const employeesApiUrl = "http://localhost:5001/api/employees"; // URL to fetch employees

function Projects() {
  const [qualifiedDeals, setQualifiedDeals] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});
  const [employees, setEmployees] = useState([]); // State for employees
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    dueDate: "",
    team: [], // Store multiple team members
    status: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  useEffect(() => {
    fetchQualifiedDeals(); // Fetch all qualified deals on page load
    fetchProjectDetails(); // Fetch all project details on page load
    fetchEmployees(); // Fetch all employees on page load
  }, []);

  // Fetch qualified deals from the deals API
  const fetchQualifiedDeals = async () => {
    try {
      const response = await fetch(dealsApiUrl);
      const data = await response.json();
      const qualified = data.filter((deal) => deal.stage === "Qualified");
      setQualifiedDeals(qualified);
    } catch (error) {
      console.error("Error fetching qualified deals:", error);
    }
  };

  // Fetch all project details from the backend
  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(projectsDetailsApiUrl);
      const data = await response.json();
      console.log("Fetched project details:", data); // Add this line to inspect the response format
      if (Array.isArray(data)) {
        const detailsMap = {};
        data.forEach((project) => {
          detailsMap[project.name] = project; // Map project name to its details
        });
        setProjectDetails(detailsMap); // Store in state
      } else {
        console.error("Fetched data is not an array", data);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  // Fetch employees from the employees API
  const fetchEmployees = async () => {
    try {
      const response = await fetch(employeesApiUrl);
      const data = await response.json();
      if (Array.isArray(data.employees)) {
        setEmployees(data.employees); // Assuming employees are stored under the 'employees' key
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Get project details by name (if available)
  const getProjectDetail = (projectName) => {
    const project = projectDetails[projectName] || {};
    
    // Safeguard the team to always be an array (default to empty array if undefined)
    const team = Array.isArray(project.team) ? project.team : [];
  
    return {
      dueDate: project.dueDate || "N/A",
      team,  // Return the validated team array
      status: project.status || "N/A"
    };
  };

  const handleEdit = (deal) => {
    setSelectedDeal(deal);
    const existingDetails = projectDetails[deal.name] || {};

    setFormData({
      name: deal.name,
      dueDate: existingDetails.dueDate || "",
      team: existingDetails.team || [], // Expecting an array for multiple team members
      status: existingDetails.status || "",
    });
    setIsModalOpen(true);
    setErrorMessage(""); // Clear any previous error message
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // For the team field (multiple selection), we need to handle it as an array
    if (name === "team") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validate due date
  const isDueDateValid = (dueDate) => {
    const today = new Date().toISOString().split("T")[0];  // Get today's date in yyyy-mm-dd format
    return dueDate >= today;  // Check if due date is today or later
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validate the due date before submitting
    if (!isDueDateValid(formData.dueDate)) {
      setErrorMessage("Due date cannot be earlier than today.");
      return;  // Prevent submission if due date is invalid
    }

    try {
      const response = await fetch(projectsDetailsApiUrl, {
        method: "POST",  // Same POST method for both create and update
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedDeal._id,  // Use the selectedDeal's ID
          name: selectedDeal.name, // Name from the qualified deal
          ...formData,  // All other form data
        }),
      });

      if (response.ok) {
        // Update the project details directly in the state without needing to refresh
        const updatedProject = { ...formData, id: selectedDeal._id };
        
        // Update the project details in the `projectDetails` state
        setProjectDetails((prevDetails) => ({
          ...prevDetails,
          [selectedDeal.name]: updatedProject,
        }));

        // Update the `qualifiedDeals` state (if necessary)
        setQualifiedDeals((prevDeals) =>
          prevDeals.map((deal) =>
            deal._id === selectedDeal._id
              ? { ...deal, name: formData.name } // Update any changes in project name
              : deal
          )
        );

        alert("Project details saved successfully!");
        setIsModalOpen(false);
        setErrorMessage(""); // Clear error message if submission is successful
      } else {
        console.error("Failed to save project details");
      }
    } catch (error) {
      console.error("Error saving project details:", error);
    }
  };

  // Convert status text to percentage
const getStatusPercentage = (status) => {
  switch (status) {
    case "To Do":
      return 0;
    case "Open":
      return 20;
    case "In Progress":
      return 50;
    case "Completed":
      return 100;
    default:
      return 0;
  }
};

// Get color based on status percentage
const getStatusColor = (percentage) => {
  if (percentage === 0) return "transparent";
  if (percentage === 20) return "red";
  if (percentage === 50) return "yellow";
  if (percentage === 100) return "green";
  return "gray";
};


  return (
    <div
      className="qualified-deals-container"
      style={{ marginLeft: "17%", width: "70%", marginTop: "5%" }}
    >
      <h2>Running Projects</h2>
      <table className="qualified-deals-table">
        <thead>
          <tr>
         
            <th>Project Name</th>
            <th>Due Date</th>
            <th>Team</th>
            <th>Status</th>
            <th>Actions</th>
            <th>View Project</th>
          </tr>
        </thead>
        <tbody>
  {qualifiedDeals.map((deal) => {
    const { dueDate, team, status } = getProjectDetail(deal.name);
    return (
      <tr key={deal._id}>
        <td>{deal.name}</td>
        <td>{dueDate}</td>
        <td>{team.length > 0 ? team.join(", ") : "N/A"}</td> {/* Safely join the team members */}
        <td>
  <div style={{ 
    display: "flex", 
    alignItems: "center" 
  }}>
    <div style={{ 
      width: "100px", 
      height: "10px", 
      backgroundColor: "#ddd", 
      borderRadius: "5px", 
      overflow: "hidden",
      marginRight: "10px"  // Space between bar and text
    }}>
      <div style={{ 
        width: `${getStatusPercentage(status)}%`, 
        height: "100%", 
        backgroundColor: getStatusColor(getStatusPercentage(status)), 
        transition: "width 0.5s ease-in-out" 
      }}></div>
    </div>
    <span>{getStatusPercentage(status)}%</span> {/* Display the percentage */}
  </div>
</td>


        <td>
          <button
            onClick={() => handleEdit(deal)}
            style={{
              marginRight: "10px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </td>
    <td>{"N/A"}</td>
      </tr>
    );
  })}
</tbody>
      </table>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <h3>Edit Project</h3>
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label>
                Project Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled
                  style={{ marginLeft: "10px", width: "200px" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>
                Due Date:
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  style={{ marginLeft: "10px", width: "200px" }}
                />
              </label>
            </div>
            {errorMessage && (
              <div style={{ color: "red", marginBottom: "10px" }}>
                {errorMessage}
              </div>
            )}
            <div style={{ marginBottom: "10px" }}>
              <label>
                Team:
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleFormChange}
                  multiple // Allow multiple selections
                  style={{ marginLeft: "10px", width: "200px", height: "150px" }}
                >
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>
                Status:
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  style={{ marginLeft: "10px", width: "210px" }}
                >
                  <option value="">Select Status</option>
                  <option value="To Do">To Do</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              style={{
                marginRight: "10px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setIsModalOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Projects;
