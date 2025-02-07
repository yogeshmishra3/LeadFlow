import React from 'react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar">
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        ☰
      </button>
    </nav>
  );
};

export default Navbar;
