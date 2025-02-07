import React, { useState, useEffect } from "react";
import "./Tasks.css";

const apiUrl = "https://crm-mu-sooty.vercel.app/api"; // Make sure your backend URL is correct

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [recycleBinTasks, setRecycleBinTasks] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Added for edit popup
  const [newTask, setNewTask] = useState({
    taskName: "",
    taskDescription: "",
    taskStatus: "Open",
    clientName: "",
    startDate: "",
    dueDate: "",
  });
  const [taskToEdit, setTaskToEdit] = useState(null); // Track the task being edited
  const [isLoading, setIsLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false); // State for controlling error popup visibility

  useEffect(() => {
    fetchTasks();
    fetchRecycleBinTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/Newtasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      } else {
        console.error("Failed to fetch tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecycleBinTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/Newrecycle-bin`);
      const data = await response.json();
      if (data.success) {
        setRecycleBinTasks(data.recycledTasks);
      } else {
        console.error("Failed to fetch recycled tasks:", data.message);
      }
    } catch (error) {
      console.error("Error fetching recycled tasks:", error);
    }
  };

  const handleAddTask = async () => {
    const { taskName, taskDescription, taskStatus, clientName, startDate, dueDate } = newTask;

    // Check if the due date is greater than the start date
    if (new Date(dueDate) <= new Date(startDate)) {
      setErrorMessage("Due date should be greater than start date.");
      setIsErrorPopupOpen(true);
      return;
    }

    if (!taskName || !taskDescription || !taskStatus || !clientName || !startDate || !dueDate) {
      setErrorMessage("Please fill in all fields.");
      setIsErrorPopupOpen(true);
      return;
    }

    // Check for duplicate task names
    const isDuplicate = tasks.some((task) => task.taskName.toLowerCase() === taskName.toLowerCase());
    if (isDuplicate) {
      setErrorMessage("A task with this name already exists. Please choose a different name.");
      setIsErrorPopupOpen(true);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/Newtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setIsPopupOpen(false);
        setNewTask({
          taskName: "",
          taskDescription: "",
          taskStatus: "Open",
          clientName: "",
          startDate: "",
          dueDate: "",
        });
        fetchTasks();
      } else {
        console.error("Failed to add task:", await response.text());
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  const handleEditTask = async () => {
    const { taskName, taskDescription, taskStatus, clientName, startDate, dueDate } = taskToEdit;

    // Check if the due date is greater than the start date
    if (new Date(dueDate) <= new Date(startDate)) {
      setErrorMessage("Due date should be greater than start date.");
      setIsErrorPopupOpen(true); // Show error popup
      return;
    }

    if (!taskName || !taskDescription || !taskStatus || !clientName || !startDate || !dueDate) {
      setErrorMessage("Please fill in all fields");
      setIsErrorPopupOpen(true); // Show error popup
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/Newtasks/edit/${taskToEdit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToEdit),
      });

      if (response.ok) {
        setIsEditPopupOpen(false);
        fetchTasks();
      } else {
        console.error("Failed to edit task:", await response.text());
      }
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      const response = await fetch(`${apiUrl}/Newtasks/archive/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchTasks();
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to archive task:", await response.text());
      }
    } catch (error) {
      console.error("Error archiving task:", error);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      const response = await fetch(`${apiUrl}/Newrecycle-bin/restore/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchTasks();
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to restore task:", await response.text());
      }
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`${apiUrl}/Newrecycle-bin/${taskToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchRecycleBinTasks();
      } else {
        console.error("Failed to delete task:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setTaskToDelete(null); // Close confirmation modal
    }
  };

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData("taskId", task._id);
    event.dataTransfer.setData("currentStatus", task.taskStatus);
  };

  const handleDrop = async (event, newStatus) => {
    const taskId = event.dataTransfer.getData("taskId");
    const currentStatus = event.dataTransfer.getData("currentStatus");

    if (currentStatus !== newStatus) {
      try {
        const response = await fetch(`${apiUrl}/tasks/${taskId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskStatus: newStatus }),
        });

        const result = await response.json();
        if (response.ok) {
          fetchTasks();
        } else {
          console.error('Failed to update task status:', result.message);
        }
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  const editTask = async (taskId, updatedData) => {
    try {
      const response = await fetch(`${apiUrl}/Newtasks/edit/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      console.log("Task updated:", updatedTask);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };


  const handleAllowDrop = (event) => event.preventDefault();

  const openEditPopup = (task) => {
    setTaskToEdit(task);
    setIsEditPopupOpen(true);
  };

  // Handle close of error popup
  const closeErrorPopup = () => {
    setIsErrorPopupOpen(false);
    setErrorMessage(""); // Clear error message
  };

  return (
    <div className="tasks-container">
      <div className="header">
        <h2>Tasks</h2>
        <button onClick={() => setIsPopupOpen(true)}>Add Task +</button>
      </div>

      <div className="tasks-board">
        {["Open", "In Progress", "To Do", "Completed"].map((status) => (
          <div
            key={status}
            className="column"
            onDragOver={handleAllowDrop}
            onDrop={(event) => handleDrop(event, status)}
          >
            <h3>{status}</h3>
            {tasks
              .filter((task) => task.taskStatus === status)
              .map((task) => (
                <div
                  key={task._id}
                  className="task-card"
                  draggable
                  onDragStart={(event) => handleDragStart(event, task)}
                >
                  <h4>{task.taskName}</h4>
                  <p>{task.taskDescription}</p>
                  <p><strong>Client:</strong> {task.clientName}</p>
                  <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                  <button onClick={() => openEditPopup(task)}>Edit</button>
                  <button onClick={() => handleArchiveTask(task._id)}>
                    Archive
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Edit Task Popup */}
      {isEditPopupOpen && taskToEdit && (
        <div className="popup">
          <div className="popup-content">
            <h3>Edit Task</h3>
            <input
              type="text"
              placeholder="Task Name"
              value={taskToEdit.taskName}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, taskName: e.target.value })
              }
            />
            <textarea
              placeholder="Task Description"
              value={taskToEdit.taskDescription}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, taskDescription: e.target.value })
              }
            ></textarea>
            <select
              value={taskToEdit.taskStatus}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, taskStatus: e.target.value })
              }
            >
              {["Open", "In Progress", "To Do", "Completed"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Client Name"
              value={taskToEdit.clientName}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, clientName: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Start Date"
              value={taskToEdit.startDate}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, startDate: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="Due Date"
              value={taskToEdit.dueDate}
              onChange={(e) =>
                setTaskToEdit({ ...taskToEdit, dueDate: e.target.value })
              }
            />
            <button onClick={handleEditTask}>Save Changes</button>
            <button className="close" onClick={() => setIsEditPopupOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {taskToDelete && (
        <div className="popup">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this task?</p>
            <button onClick={handleDeleteTask} className="deleteBtn">
              Confirm
            </button>
            <button
              onClick={() => setTaskToDelete(null)}
              className="cancelBtn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Task Popup */}
      {isPopupOpen && (
        <div className="popupp">
          <div className="popup-content">
            <h3>Add New Task</h3>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.taskName}
              onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              value={newTask.taskDescription}
              onChange={(e) =>
                setNewTask({ ...newTask, taskDescription: e.target.value })
              }
            ></textarea>
            <select
              value={newTask.taskStatus}
              onChange={(e) =>
                setNewTask({ ...newTask, taskStatus: e.target.value })
              }
            >
              {["Open", "In Progress", "To Do", "Completed"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Client Name"
              value={newTask.clientName}
              onChange={(e) =>
                setNewTask({ ...newTask, clientName: e.target.value })
              }
            />
            <label htmlFor="startDate" style={{marginRight:'320px', marginTop:'10px'}}>Start Date</label>
            <input
              type="date"
              placeholder="Start Date"
              value={newTask.startDate}
              onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
            />
            <label htmlFor="dueDate" style={{marginRight:'320px'}}>Due Date</label>
            <input
              type="date"
              placeholder="Due Date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <button onClick={handleAddTask}>Add Task</button>
            <button className="close" onClick={() => setIsPopupOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Message Popup */}
      {isErrorPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button onClick={closeErrorPopup}>Close</button>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="popup">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this task?</p>
            <button onClick={handleDeleteTask} className="deleteBtn">
              Confirm
            </button>
            <button
              onClick={() => setTaskToDelete(null)}
              className="closeBtn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="recycle-bin">
        <h3>Recycle Bin</h3>
        {recycleBinTasks.length > 0 ? (
          recycleBinTasks.map((task) => (
            <div key={task._id} className="recycle-task-card">
              <h4>{task.taskName}</h4>
              <p>{task.taskDescription}</p>
              <p><strong>Client:</strong> {task.clientName}</p>
              <p><strong>Start Date:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
              <button onClick={() => handleRestoreTask(task._id)} className="restoreBtn">
                Restore
              </button>
              <button onClick={() => setTaskToDelete(task._id)} className="deleteBtn">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No tasks in the recycle bin</p>
        )}
      </div>
    </div>
  );
}

export default Tasks;


