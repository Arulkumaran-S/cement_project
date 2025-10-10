// src/admin/Admin.jsx
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import ChatbotDataStore from "../chatbot/ChatbotDataStore"; // Make sure this is imported
import "./Admin.css";

const Admin = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    ChatbotDataStore.reset(); // This line MUST be here to clear chatbot memory
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // ... rest of the component
  return (
    <div className="admin-layout d-flex">
      <div className={`sidebar bg-dark text-white ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header p-3">
          <h2 className="fs-4 mb-0">Admin Panel</h2>
          <button className="btn-close btn-close-white d-lg-none" onClick={toggleSidebar}></button>
        </div>
        <nav className="nav flex-column p-3">
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
      <div className="content-area flex-grow-1 p-3 p-md-4">
        <button className="btn btn-dark d-lg-none mb-3" onClick={toggleSidebar}>
          ☰ Menu
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;