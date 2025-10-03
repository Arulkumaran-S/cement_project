import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const shift = JSON.parse(localStorage.getItem('user'))?.shift;

  useEffect(() => {
    API.get('/employees').then((res) => {
      const filtered = res.data.filter((e) => e.shift === shift);
      setEmployees(filtered);
    });
  }, [shift]);

  return (
    <div>
      <h3>Employees in Shift {shift}</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Experience</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>
                <Link to={`/manager/employees/${emp._id}`}>{emp.name}</Link>
              </td>
              <td>{emp.phone}</td>
              <td>{emp.experience} years</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
