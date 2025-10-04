import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import "./Admin.css"; // Import the CSS file

const Admin = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close sidebar when a NavLink is clicked
  useEffect(() => {
    if (isSidebarOpen) {
      closeSidebar();
    }
  }, [location]); // This effect runs every time the route changes


  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Make sure not to close if the menu button itself is clicked
        if (!event.target.closest('.menu-toggle-button')) {
          closeSidebar();
        }
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);


  return (
    <div className="admin-layout d-flex">
      {/* Backdrop for closing sidebar on mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${isSidebarOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-header p-3">
          <h2 className="fs-4 mb-0">Admin Panel</h2>
          <button className="btn-close btn-close-white d-lg-none" onClick={toggleSidebar}></button>
        </div>
        <nav className="nav flex-column p-3">
          {/* By using NavLink, the useEffect will trigger on route change and close the sidebar */}
          <NavLink to="/admin" className="nav-link" end>Dashboard</NavLink>
          <NavLink to="/admin/employees" className="nav-link">Employees</NavLink>
          <NavLink to="/admin/managers" className="nav-link">Managers</NavLink>
          <NavLink to="/admin/stacks" className="nav-link">Stacks</NavLink>
          <NavLink to="/admin/purchases" className="nav-link">Purchases</NavLink>
          <NavLink to="/admin/managers/attendance" className="nav-link">Mark Attendance</NavLink>
          <button onClick={handleLogout} className="btn btn-danger mt-auto mx-3">
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="content-area flex-grow-1 p-3 p-md-4">
        <button className="btn btn-dark d-lg-none mb-3 menu-toggle-button" onClick={toggleSidebar}>
          ☰ Menu
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
