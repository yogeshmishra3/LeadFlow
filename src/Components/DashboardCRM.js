import React, { useState, useEffect } from "react";
import axios from "axios";
import MeetingNotifications from './DashboardComponents/MeetingNotifications';
import TaskProgress from './DashboardComponents/TaskProgress';
import TopDeals from './DashboardComponents/TopDeals';
import './dashboardCRM.css';
import RevenueChart from "./DashboardComponents/RevenueChart";

const DashboardCRM = () => {
  const [activeContent, setActiveContent] = useState('dashboard');
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [expiringServices, setExpiringServices] = useState([]);
  const baseURL = "https://crm-mu-sooty.vercel.app/api/integrations";

  // Fetch Integrations data
  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(baseURL);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching integrations:", error.message);
      alert("Unable to fetch integrations. Please try again later.");
    }
  };

  // Check for expiring services
  const checkExpiringServices = (serviceData) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const expiringServices = serviceData.flatMap((provider) =>
      provider.services
        .filter(
          (service) =>
            service.dueDate &&
            new Date(service.dueDate).toISOString().split("T")[0] ===
            tomorrow.toISOString().split("T")[0]
        )
        .map((service) => ({
          provider: provider.provider,
          service: service.name,
          dueDate: service.dueDate,
        }))
    );

    setExpiringServices(expiringServices);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchIntegrations();
      if (data) checkExpiringServices(data);
    };
    fetchData();
  }, []);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="dashboard-crm">
      <div className="header-dashboard">
        <h2>Dashboard</h2>
      </div>
      <div className="chartSection">
        <MeetingNotifications />
        <TopDeals />
      </div>
      <div className="taskSection">
        <TaskProgress />
        <RevenueChart/>
      </div>
      {activeContent === "/" && <DashboardCRM />}


      {/* Pop-up Modal for Expiring Services */}
      {isPopupVisible && expiringServices.length > 0 && (
        <div className="popup-overlayy">
          <div className="popup-contentt">
            <h3>Expiring Services</h3>
            <ul>
              {expiringServices.map((notification, index) => (
                <li key={index}>
                  <strong>{notification.provider}</strong> - {notification.service} is expiring on{" "}
                  {new Date(notification.dueDate).toISOString().split("T")[0]}.
                </li>
              ))}
            </ul>
            <button
              onClick={handleClosePopup}
              style={{
                padding: '10px 20px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCRM;