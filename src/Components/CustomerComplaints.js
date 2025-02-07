import { useState, useEffect } from "react";

export default function CustomerComplaintsDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [updatedComplaint, setUpdatedComplaint] = useState({});

    useEffect(() => {
        fetch("https://crm-mu-sooty.vercel.app/api/complaints")
            .then((res) => res.json())
            .then((data) => setComplaints(data))
            .catch((error) => console.error("Error fetching complaints:", error));
    }, []);

    const handleDelete = (id) => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure you want to delete this complaint?")) {
            fetch(`https://crm-mu-sooty.vercel.app/api/complaints/${id}`, {
                method: "DELETE",
            })
                .then((res) => {
                    if (res.ok) {
                        setComplaints(complaints.filter((complaint) => complaint._id !== id));
                        alert("Complaint deleted successfully");
                    } else {
                        alert("Error deleting complaint");
                    }
                })
                .catch((error) => console.error("Error deleting complaint:", error));
        }
    };

    const handleEdit = (complaint) => {
        setEditingComplaint(complaint);
        setUpdatedComplaint(complaint);
    };

    const handleChange = (e) => {
        setUpdatedComplaint({ ...updatedComplaint, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        fetch(`https://crm-mu-sooty.vercel.app/api/complaints/${editingComplaint._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedComplaint),
        })
            .then((res) => res.json())
            .then((data) => {
                setComplaints(
                    complaints.map((comp) =>
                        comp._id === editingComplaint._id ? data : comp
                    )
                );
                setEditingComplaint(null);
                alert("Complaint updated successfully");
            })
            .catch((error) => console.error("Error updating complaint:", error));
    };

    const styles = {
        container: {
            padding: "20px",
            maxWidth: "900px",
            margin: "auto",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        },
        title: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center",
        },
        cardContainer: {
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
        },
        card: {
            background: "#f4f4f4",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            width: "250px",
        },
        cardTitle: {
            fontWeight: "bold",
            marginBottom: "10px",
        },
        cardText: {
            marginBottom: "5px",
        },
        link: {
            color: "#007BFF",
            textDecoration: "none",
            cursor: "pointer",
        },
        button: {
            marginTop: "10px",
            padding: "8px 15px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "5px",
        },
        deleteButton: {
            backgroundColor: "#FF5733",
        },
    };

    
    return (
        <div style={{marginLeft:"17%"}}>
            <h2 style={styles.title}>Complaint Dashboard</h2>
            <div style={styles.cardContainer}>
                {complaints.map((complaint) => (
                    <div key={complaint._id} style={styles.card}>
                        <div style={styles.cardTitle}>{complaint.projectName}</div>
                        <div style={styles.cardText}>
                            <strong>Complaint ID:</strong> {complaint.complaintID}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Client Name:</strong> {complaint.fullName}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Subject:</strong> {complaint.subject}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Email:</strong> {complaint.email}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Category:</strong> {complaint.category}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Description:</strong> {complaint.complaintDescription}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Preferred Contact:</strong> {complaint.preferredContact}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Attachment: </strong>
                            {complaint.attachment ? (
                                <a
                                    href={complaint.attachment}
                                    style={styles.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Attachment
                                </a>
                            ) : (
                                "No attachment"
                            )}
                        </div>
                        <div style={styles.cardText}>
                            <strong>Status:</strong> {complaint.status || "Pending"}
                        </div>
                        <div>
                            <button
                                style={styles.button}
                                onClick={() => handleEdit(complaint)}
                            >
                                Edit
                            </button>
                            <button
                                style={{ ...styles.button, ...styles.deleteButton }}
                                onClick={() => handleDelete(complaint._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {editingComplaint && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Edit Complaint</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                        <div>
                            <label>Project Name:</label>
                            <input
                                type="text"
                                name="projectName"
                                value={updatedComplaint.projectName || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Client Name:</label>
                            <input
                                type="text"
                                name="fullName"
                                value={updatedComplaint.fullName || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Subject:</label>
                            <input
                                type="text"
                                name="subject"
                                value={updatedComplaint.subject || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={updatedComplaint.email || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Category:</label>
                            <input
                                type="text"
                                name="category"
                                value={updatedComplaint.category || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Description:</label>
                            <textarea
                                name="complaintDescription"
                                value={updatedComplaint.complaintDescription || ""}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Preferred Contact:</label>
                            <input
                                type="text"
                                name="preferredContact"
                                value={updatedComplaint.preferredContact}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div>
                            <label>Update:</label>
                            <input
                                type="text"
                                name="status"
                                value={updatedComplaint.status}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" style={styles.button}>Update</button>
                        <button type="button" style={styles.button} onClick={() => setEditingComplaint(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
}