//Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

// 아이콘
import { FaBars } from 'react-icons/fa';

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        {/* <img src="/logo.png" alt="StockFlix" /> */}
        <span>StockFlix</span>
      </Link>

      <div className="navbar-actions">
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;