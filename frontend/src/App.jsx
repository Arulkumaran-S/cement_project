// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import ChatbotDataStore from './chatbot/ChatbotDataStore';

// Component Imports
import LoginPage from './home/login/LoginPage';
import HomePage from './home/homepage/HomePage';
import About from './home/about/About';
import Contact from './home/contact/Contact';
import Admin from './admin/Admin';
import AdminDashboard from './admin/dashboard/AdminDashboard';
import EmployeeList from './admin/employees/EmployeeList';
import EmployeeDetails from './admin/employees/EmployeeDetails';
import ManagerList from './admin/managers/ManagerList';
import ManagerDetails from './admin/managers/ManagerDetails';
import StackList from './admin/stacks/StackList';
import StackDetails from './admin/stacks/StackDetails';
import AdminManagerAttendance from './admin/managers/AdminManagerAttendance';
import PurchaseList from './admin/purchases/PurchaseList';
import PurchaseDetails from './admin/purchases/PurchaseDetails';
import Manager from './manager/Manager';
import ManagerDashboard from './manager/dashboard/ManagerDashboard';
import ManagerAttendance from './manager/attendance/ManagerAttendance';
import ManagerEmployeeView from './manager/employees/ManagerEmployeeView';
import StackMaintain from './stack/StackMaintain'; // Corrected import based on file name
import ChatbotLauncher from './chatbot/ChatbotLauncher';

const App = () => {
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (role && role !== 'guest') {
            ChatbotDataStore.init();
        }
    }, [role]);

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/admin" element={role === 'admin' ? <Admin /> : <Navigate to="/login" />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="employees" element={<EmployeeList />} />
                    <Route path="employees/:id" element={<EmployeeDetails />} />
                    <Route path="managers" element={<ManagerList />} />
                    <Route path="managers/attendance" element={<AdminManagerAttendance />} />
                    <Route path="managers/:managerId" element={<ManagerDetails />} />
                    <Route path="stacks" element={<StackList />} />
                    <Route path="stacks/:id" element={<StackDetails />} />
                    <Route path="purchases" element={<PurchaseList />} />
                    <Route path="purchases/:id" element={<PurchaseDetails />} />
                </Route>
                
                <Route path="/manager" element={role === 'manager' ? <Manager /> : <Navigate to="/login" />}>
                    <Route index element={<ManagerDashboard />} />
                    <Route path="attendance" element={<ManagerAttendance />} />
                    <Route path="employees" element={<ManagerEmployeeView />} />
                    <Route path="employees/:id" element={<EmployeeDetails />} />
                </Route>
                
                <Route path="/stack/*" element={role === 'stack' ? <StackMaintain /> : <Navigate to="/login" />} />
            </Routes>
            <ChatbotLauncher />
        </>
    );
};

export default App;