import { useEffect, useState } from 'react';
import API from '../../utils/api';

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setUser(u);

    if (u?.shift) {
      API.get('/employees').then((res) => {
        const filtered = res.data.filter((e) => e.shift === u.shift);
        setEmployees(filtered);
      });
    }
  }, []);

  return (
    <div>
      <h3>Welcome, {user?.name} (Shift {user?.shift})</h3>
      <p>Total Employees in Your Shift: {employees.length}</p>
    </div>
  );
};

export default ManagerDashboard;
