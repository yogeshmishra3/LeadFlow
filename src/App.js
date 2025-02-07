import './App.css';
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import Contacts from './Components/Contacts';
import Tasks from './Components/Tasks';
import Login from './Components/Login';
import SendEmail from './Components/SendEmail';
import EmailManagement from './Components/EmailManagement';
import Quotes from './Components/Quotes';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Firebase setup
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7OuII_7uoDgvomQQbPVwT9ri5bXqs84M",
  authDomain: "akprortfolio.firebaseapp.com",
  databaseURL: "https://akprortfolio-default-rtdb.firebaseio.com",
  projectId: "akprortfolio",
  storageBucket: "akprortfolio.firebasestorage.app",
  messagingSenderId: "784602760468",
  appId: "1:784602760468:web:02238859fa918e89cbee01",
  measurementId: "G-YPLD4B7HP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exporting auth

function App() {
  const [activeContent, setActiveContent] = useState('image');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsAuthenticated(false);
      setIsLogoutModalOpen(false); // Close the modal after logging out
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveContent('dashboardCRM'); // Set default dashboard view after login
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="app">
      {isAuthenticated ? (
        <Router>
          <Sidebar
            setActiveContent={setActiveContent}
            handleLogout={openLogoutModal} // Open modal when clicking logout
          />
          <div className="main">
            <Navbar toggleSidebar={toggleSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard activeContent={activeContent} />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/emails" element={<EmailManagement />} />
              <Route path="/send-email" element={<SendEmail />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/quotes" element={<Quotes />} />
            </Routes>
          </div>

          {/* Logout Confirmation Modal */}
          {isLogoutModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to logout?</p>
                <div className="modal-buttons">
                  <button onClick={handleLogout} className="confirm-button">
                    Yes
                  </button>
                  <button onClick={closeLogoutModal} className="cancel-button">
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </Router>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
