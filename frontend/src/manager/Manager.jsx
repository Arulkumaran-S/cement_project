import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';

import ManagerDashboard from './dashboard/ManagerDashboard';
import EmployeeList from './employees/EmployeeList';
import EmployeeDetails from './employees/EmployeeDetails';
// import AttendancePage from './employees/AttendancePage';

const Manager = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Manager Panel</h2>
        <nav className="flex flex-col space-y-4">
          <Link to="/manager" className="hover:underline">Dashboard</Link>
          <Link to="/manager/employees" className="hover:underline">Employees</Link>
          {/* Add other links here if needed */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="mt-10 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route path="/" element={<ManagerDashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          {/* <Route path="attendance" element={<AttendancePage />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default Manager;
