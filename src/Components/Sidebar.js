import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CRMlogo from './Assets/CRMlogo.png';
import {
  faPowerOff,
  faTachometerAlt,
  faTasks,
  faAddressBook,
  faBuilding,
  faBullhorn,
  faHandshake,
  faCalendarAlt,
  faProjectDiagram,
  faEnvelope,
  faExclamationTriangle,
  faWallet,
  faPuzzlePiece,
  faCog,
  faRightFromBracket, // Logout icon matching your image
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ setActiveContent, handleLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeButton, setActiveButton] = useState('dashboardCRM');
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLinkClick = (content) => {
    setActiveButton(content);
    setActiveContent(content);
    setIsSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', content: 'dashboardCRM', icon: faTachometerAlt },
    { name: 'Tasks', content: 'tasks', icon: faTasks },
    { name: 'Contacts', content: 'contacts', icon: faAddressBook },
    { name: 'Organization', content: 'Organization', icon: faBuilding },
    { name: 'Leads', content: 'events', icon: faBullhorn },
    { name: 'Leads Management', content: 'deals', icon: faHandshake },
    { name: 'Schedule', content: 'schedule', icon: faCalendarAlt },
    { name: 'Projects', content: 'projects', icon: faProjectDiagram },
    { name: 'Emails', content: 'emails', icon: faEnvelope },
    { name: 'Customer Complaints', content: 'complains', icon: faExclamationTriangle },
    { name: 'Finance', content: 'finance', icon: faWallet },
    { name: 'Integration', content: 'integration', icon: faPuzzlePiece },
    { name: 'Setting', content: 'setting', icon: faCog },
  ];

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        ☰
      </button>
      <img src={CRMlogo} width={200} height={190} style={{ marginTop: '-38%' }} />
      <ul style={{ marginTop: '-30%' }}>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={activeButton === item.content || location.pathname === item.path ? 'active' : ''}
            onClick={() => handleLinkClick(item.content)}
            style={{ padding: '12px', display: 'flex', alignItems: 'center' }}
          >
            <FontAwesomeIcon icon={item.icon} style={{ marginRight: '10px', color: '#555' }} />
            <Link to={item.path} style={{ color: 'inherit', textDecoration: 'none', fontFamily: 'Poppins', fontSize: '14px' }}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      {/* Logout Icon */}
      <div className="logout-icon" onClick={handleLogout} style={{ marginTop: '-6%', padding: '12px', marginBottom: '30px', color:'#E57373' }}>
        <FontAwesomeIcon icon={faRightFromBracket} style={{ color: '#E57373', fontSize: '14px', cursor: 'pointer', marginRight:'10px' }} />Log out
      </div>
    </div>
  );
};

export default Sidebar;
