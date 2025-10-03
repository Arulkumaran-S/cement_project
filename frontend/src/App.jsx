import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Public Components
import LoginPage from './home/login/LoginPage';
import HomePage from './home/homepage/HomePage';
import About from './home/about/About';
import Contact from './home/contact/Contact';

// Admin Components
import Admin from './admin/Admin';
import AdminDashboard from './admin/dashboard/AdminDashboard';
import EmployeeList from './admin/employees/EmployeeList';
import EmployeeDetails from './admin/employees/EmployeeDetails';
import ManagerList from './admin/managers/ManagerList';
import ManagerDetails from './admin/managers/ManagerDetails';
import StackList from './admin/stacks/StackList';
import StackDetails from './admin/stacks/StackDetails';
import AdminManagerAttendance from './admin/managers/AdminManagerAttendance';

// ✅ NEW IMPORTS
import PurchaseList from './admin/purchases/PurchaseList';
import PurchaseDetails from './admin/purchases/PurchaseDetails';


// Manager & Stack Components
import Manager from './manager/Manager';
import Stackmaintain from './stack/StackMaintain';

const App = () => {
  const role = localStorage.getItem('role');

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={role === 'admin' ? <Admin /> : <Navigate to="/login" />}
      >
        <Route index element={<AdminDashboard />} />
        
        {/* Employees */}
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        
        {/* Managers */}
        <Route path="managers" element={<ManagerList />} />
        <Route path="managers/attendance" element={<AdminManagerAttendance />} />
        <Route path="managers/:managerId" element={<ManagerDetails />} />
        
        {/* Stacks */}
        <Route path="stacks" element={<StackList />} />
        <Route path="stacks/:id" element={<StackDetails />} />
        
        {/* ✅ NEW ROUTES ADDED HERE */}
        <Route path="purchases" element={<PurchaseList />} />
        <Route path="purchases/:id" element={<PurchaseDetails />} />

      </Route>

      {/* Protected Manager Route */}
      <Route
        path="/manager/*"
        element={role === 'manager' ? <Manager /> : <Navigate to="/login" />}
      />

      {/* Protected Stack Route */}
      <Route
        path="/stack/*"
        element={role === 'stack' ? <Stackmaintain /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default App;