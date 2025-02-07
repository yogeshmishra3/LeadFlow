import React, { useState, useEffect } from "react";
import "./Schedule.css"; // Import external CSS file
import axios from "axios";

const Calendar = () => {
    const API_BASE_URL = "https://crm-mu-sooty.vercel.app/api/meetings";
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [notes, setNotes] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [noteText, setNoteText] = useState("");
    const [keyword, setKeyword] = useState(""); // Fix missing state for keyword
    const [modalError, setModalError] = useState("");
    const [isEditing, setIsEditing] = useState(false);  // To track if you are editing an existing event
    const [editIndex, setEditIndex] = useState(null);  // To store the index of the event being edited

    useEffect(() => {
        fetchMeetings();
    }, [currentMonth, currentYear]);

    const fetchMeetings = async () => {
        try {
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            let updatedNotes = {};
            const requests = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const formattedDate = formatDate(currentYear, currentMonth, day);
                requests.push(axios.get(`${API_BASE_URL}/${formattedDate}`).then(response => {
                    updatedNotes[formattedDate] = response.data.meetings || [];
                }));
            }
            await Promise.all(requests);
            setNotes(updatedNotes);
        } catch (error) {
            console.error("Error fetching meetings:", error);
        }
    };

    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleEditEvent = (index) => {
        const event = dayEvents[index];
        setStartTime(event.startTime);
        setEndTime(event.endTime);
        setNoteText(event.note);
        setKeyword(event.keyword || "");
        setIsEditing(true);
        setEditIndex(index);
    };

    const handleDeleteEvent = async (index) => {
        const event = dayEvents[index];
        const formattedDate = formatDate(currentYear, currentMonth, selectedDay);
        try {
            await axios.delete(`${API_BASE_URL}/delete`, {
                data: { date: formattedDate, startTime: event.startTime }
            });
            setDayEvents(dayEvents.filter((_, i) => i !== index));
            fetchMeetings();
        } catch (error) {
            console.error("Error deleting meeting:", error);
        }
    };

    const handleSaveNote = async () => {
        if (!startTime || !endTime || !noteText || !keyword) {
            setModalError("All fields are required.");
            return;
        }

        const today = new Date();
        const selectedDate = new Date(currentYear, currentMonth, selectedDay);
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setModalError("Cannot schedule meetings in the past.");
            return;
        }

        const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

        if (selectedDate.getTime() === today.getTime() && endTime <= currentTime) {
            setModalError("Cannot schedule meetings with past times.");
            return;
        }

        if (startTime >= endTime) {
            setModalError("End time must be later than start time.");
            return;
        }

        const isOverlapping = dayEvents.some(event =>
            (startTime >= event.startTime && startTime < event.endTime) ||
            (endTime > event.startTime && endTime <= event.endTime) ||
            (startTime <= event.startTime && endTime >= event.endTime)
        );

        if (isOverlapping) {
            setModalError("Meeting time overlaps with an existing event.");
            return;
        }

        const formattedDate = formatDate(currentYear, currentMonth, selectedDay);

        try {
            if (isEditing) {
                const updatedEvents = [...dayEvents];
                updatedEvents[editIndex] = { startTime, endTime, note: noteText, keyword };
                setDayEvents(updatedEvents);
                setIsEditing(false);
                await axios.put(`${API_BASE_URL}/update`, { date: formattedDate, startTime, endTime, note: noteText, keyword });
            } else {
                const newEvent = { startTime, endTime, note: noteText, keyword };
                setDayEvents([...dayEvents, newEvent]);
                await axios.post(API_BASE_URL, { date: formattedDate, startTime, endTime, note: noteText, keyword });
            }

            setShowModal(false);
            fetchMeetings();
            setStartTime('');
            setEndTime('');
            setNoteText('');
            setKeyword('');
        } catch (error) {
            setModalError(error.response?.data?.message || "Error saving meeting.");
        }
    };


    const addNote = (day) => {
        setSelectedDay(day);
        const dateKey = formatDate(currentYear, currentMonth, day);
        setDayEvents(notes[dateKey] || []);
        setShowModal(true);
        setStartTime("");
        setEndTime("");
        setNoteText("");
        setKeyword("");
        setModalError("");
    };

    const loadCalendarDays = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    };

    const getMonthName = (monthIndex) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ];
        return months[monthIndex];
    };

    const changeMonth = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const days = loadCalendarDays();
    return (
        <div>
            <div className="header-calendar">
                <button className="button" onClick={() => changeMonth(-1)}>Previous</button>
                <input
                    type="number"
                    value={currentYear}
                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                    className="year-input"
                />
                <button className="button" onClick={() => changeMonth(1)}>Next</button>
            </div>

            <div className="calendar-container">
                <h4>{`${getMonthName(currentMonth)} ${currentYear}`}</h4>
                <table className="calendar-table">
                    <thead>
                        <tr>
                            <th>Sun</th>
                            <th>Mon</th>
                            <th>Tue</th>
                            <th>Wed</th>
                            <th>Thu</th>
                            <th>Fri</th>
                            <th>Sat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => (
                            <tr key={i}>
                                {days.slice(i * 7, i * 7 + 7).map((day, index) => {
                                    const dateKey = day ? formatDate(currentYear, currentMonth, day) : null;
                                    const hasNotes = day && notes[dateKey]?.length > 0;
                                    const keywords = day && notes[dateKey];

                                    return (
                                        <td
                                            key={`day-${i}-${index}`}
                                            className={`day-cell ${day === currentDate.getDate() &&
                                                currentMonth === currentDate.getMonth() &&
                                                currentYear === currentDate.getFullYear()
                                                ? "current-date"
                                                : ""
                                                } ${hasNotes ? "highlighted" : ""}`}
                                            onClick={() => day && addNote(day)}
                                        >
                                            {day}
                                            {keywords && keywords.length > 0 && (
                                                <div className="keywords">
                                                    {keywords.map((event, idx) => (
                                                        <span key={idx} className="keyword">
                                                            {event.keyword && Array.isArray(event.keyword) ? event.keyword.join(', ') : event.keyword}
                                                            <br/>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {showModal && (
                    <div className="left-sidebar" onClick={() => setShowModal(false)}>
                        <div className="left-sidebar1" onClick={(e) => e.stopPropagation()}>
                            <h3>Events for {`${selectedDay} ${getMonthName(currentMonth)} ${currentYear}`}</h3>

                            {dayEvents.length > 0 ? (
                                dayEvents.map((event, index) => (
                                    <div key={index} className="event">
                                        <p>{`${event.startTime} - ${event.endTime}: ${event.note}`}</p>
                                        <button className="button" onClick={() => handleEditEvent(index)}>Edit</button>
                                        <button className="button" onClick={() => handleDeleteEvent(index)}>Delete</button>
                                    </div>
                                ))
                            ) : (
                                <p>No events scheduled for this day.</p>
                            )}

                            <h4>Add New Event</h4>
                            {modalError && <p className="error-text">{modalError}</p>}

                            <label>Start Time:</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <br />

                            <label>End Time:</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                            <br />

                            <label>Notes:</label>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows="3"
                                className="note-input"
                            />
                            <br />

                            <label>Keyword:</label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="keyword-input"
                            />
                            <br />

                            <button className="button" onClick={handleSaveNote}>Save</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Calendar;