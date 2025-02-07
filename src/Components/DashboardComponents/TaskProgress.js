import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TaskProgress.css"; // Ensure correct styles are added

const TaskProgress = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        axios
            .get('https://crm-mu-sooty.vercel.app/api/IDTasks') // Use the correct backend URL
            .then(response => {
                console.log('Fetched tasks:', response.data);
                setTasks(response.data.tasks || []);
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }, []);

    return (
        <div className="task-progress-container">
            <h3 className="task-progress-title">Tasks</h3>

            {tasks.length > 0 ? (
                tasks.map((task, index) => (
                    <div key={index} className="progress-item">
                        <p className="progress-label">
                            {task.status ? `${task.status}: ${task.percentage}%` : 'No status available'}
                        </p>
                        <div className="progress-bar-container">
                            <div
                                className={`progress-bar ${task.status?.toLowerCase().replace(' ', '-') || 'default'}`}
                                style={{ width: `${task.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No task data available.</p>
            )}
        </div>
    );
};

export default TaskProgress;
