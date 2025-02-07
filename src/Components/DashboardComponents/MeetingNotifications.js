import React, { useState, useEffect } from "react";
import axios from "axios";

const MeetingNotifications = () => {
    const API_BASE_URL = "https://crm-mu-sooty.vercel.app/api/meetings";
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const todayFormatted = formatDate(today);
            const tomorrowFormatted = formatDate(tomorrow);

            const todayMeetings = await axios.get(`${API_BASE_URL}/${todayFormatted}`);
            const tomorrowMeetings = await axios.get(`${API_BASE_URL}/${tomorrowFormatted}`);

            setMeetings([
                { date: todayFormatted, events: todayMeetings.data.meetings || [], isTomorrow: false },
                { date: tomorrowFormatted, events: tomorrowMeetings.data.meetings || [], isTomorrow: true }
            ]);
        } catch (err) {
            if (err.response) {
                // Server responded with a status other than 200
                setError(`Error: ${err.response.status} - ${err.response.data.message || 'An error occurred'}`);
            } else {
                // Network or other issues
                setError('Error fetching meetings. Please check your network connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div style={{
            width: "500px",
            margin: "20px",
            padding: "15px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            fontFamily: "Arial, sans-serif"
        }}>
            <h3 style={{
                color: "#333",
                marginBottom: "10px"
            }}>Meeting Schedule</h3>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }} aria-live="assertive">{error}</p>
            ) : (
                <div>
                    {meetings.map(({ date, events, isTomorrow }) => (
                        <div key={date} style={{
                            background: "white",
                            padding: "10px",
                            borderRadius: "5px",
                            marginBottom: "10px",
                            boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
                            borderLeft: "5px solid #007bff",
                            opacity: isTomorrow ? 0.7 : 1 // Set opacity to 0.7 for tomorrow's meetings
                        }}>
                            <h4 style={{ margin: "5px 0", color: "#007bff" }}>Meetings on {date}</h4>
                            {events.length > 0 ? (
                                events.map((event, index) => (
                                    <p key={index} style={{ margin: "5px 0", fontSize: "14px", color: "#555", marginTop: "10px" }}>
                                        {`Time: ${event.startTime} - ${event.endTime} `} {`Purpose: ${event.keyword}`}<br />
                                        {`Desc :${event.note}`} 
                                    </p>

                                ))
                            ) : (
                                <p style={{ color: "#777", opacity: "0.6" }}>No meetings scheduled.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetingNotifications;