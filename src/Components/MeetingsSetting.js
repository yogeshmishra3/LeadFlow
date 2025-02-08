import React, { useEffect, useState } from "react";
import axios from "axios";

const MeetingSetting = () => {
    const API_BASE_URL = "https://crm-mu-sooty.vercel.app/api/meetings";
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [updatedMeeting, setUpdatedMeeting] = useState({
        date: '',
        startTime: '',
        endTime: '',
        note: '',
        keyword: ''
    });
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setMeetings(response.data.meetings);
            setFilteredMeetings(response.data.meetings); // Initialize filtered meetings with all meetings
        } catch (error) {
            setError("Error fetching meetings");
            console.error("Error fetching meetings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (meeting) => {
        setEditingMeeting(meeting._id);
        setUpdatedMeeting({ ...meeting });
    };

    const handleUpdate = async () => {
        try {
            console.log("Updating meeting with data:", updatedMeeting);  // Add logging for debugging
            await axios.put(`${API_BASE_URL}/update, updatedMeeting`);
            setEditingMeeting(null);  // Reset editing state
            fetchMeetings();  // Refetch meetings after update
        } catch (error) {
            setError("Error updating meeting");
            console.error("Error updating meeting:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/delete, { data: { id } }`);
            setMeetings(meetings.filter(meeting => meeting._id !== id));
            alert("Deleted Successfully");
            fetchMeetings();
        } catch (error) {
            setError("Error deleting meeting");
            console.error("Error deleting meeting:", error);
        }
    };

    // Filter meetings based on selected date
    const handleDateFilter = (event) => {
        const filterDate = event.target.value;
        setSelectedDate(filterDate);

        if (filterDate) {
            // Filter meetings based on the selected date
            const filtered = meetings.filter(meeting => meeting.date === filterDate);
            setFilteredMeetings(filtered);
        } else {
            // Show all meetings if no date is selected
            setFilteredMeetings(meetings);
        }
    };

    return (
        <div className="meeting-settings">
            <h2>All Meetings</h2>

            {/* Date Filter Input */}
            <div>
                <label htmlFor="date-filter">Filter by Date:</label>
                <input
                    type="date"
                    id="date-filter"
                    value={selectedDate}
                    onChange={handleDateFilter}
                />
            </div>

            {loading ? (
                <p>Loading meetings...</p>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
                <div>
                    {/* Edit Form */}
                    {editingMeeting && (
                        <div className="edit-form">
                            <h3>Edit Meeting</h3>
                            <input
                                type="date"
                                value={updatedMeeting.date}
                                onChange={(e) => setUpdatedMeeting({ ...updatedMeeting, date: e.target.value })}
                            />
                            <input
                                type="time"
                                value={updatedMeeting.startTime}
                                onChange={(e) => setUpdatedMeeting({ ...updatedMeeting, startTime: e.target.value })}
                            />
                            <input
                                type="time"
                                value={updatedMeeting.endTime}
                                onChange={(e) => setUpdatedMeeting({ ...updatedMeeting, endTime: e.target.value })}
                            />
                            <textarea
                                value={updatedMeeting.note}
                                onChange={(e) => setUpdatedMeeting({ ...updatedMeeting, note: e.target.value })}
                            />
                            <input
                                type="text"
                                value={updatedMeeting.keyword}
                                onChange={(e) => setUpdatedMeeting({ ...updatedMeeting, keyword: e.target.value })}
                            />
                            <button onClick={handleUpdate}>Update</button>
                            <button onClick={() => setEditingMeeting(null)}>Cancel</button>
                        </div>
                    )}

                    {/* Meetings Table */}
                    <table className="meeting-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Note</th>
                                <th>Keyword</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMeetings.map((meeting) => {
                                return (
                                    <tr key={meeting._id}>
                                        <td>{meeting.date}</td>
                                        <td>{meeting.startTime}</td>
                                        <td>{meeting.endTime}</td>
                                        <td>{meeting.note}</td>
                                        <td>{meeting.keyword}</td>
                                        <td>
                                            <button onClick={() => handleEdit(meeting)}>Edit</button>
                                            <button onClick={() => handleDelete(meeting._id)}>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MeetingSetting;