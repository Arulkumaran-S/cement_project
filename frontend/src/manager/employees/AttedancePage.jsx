import { useEffect, useState } from 'react';
import API from '../../utils/api';

const AttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [markedIds, setMarkedIds] = useState([]);
  const shift = JSON.parse(localStorage.getItem('user'))?.shift;

  useEffect(() => {
    API.get('/employees').then((res) => {
      const filtered = res.data.filter(emp => emp.shift === shift);
      setEmployees(filtered);
    });
  }, [shift]);

  const mark = async (id, present) => {
    try {
      await API.post('/employees/mark-attendance', {
        employeeId: id,
        present,
      });

      alert('Marked successfully!');
      setMarkedIds(prev => [...prev, id]);
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking attendance');
    }
  };

  return (
    <div>
      <h3>Daily Attendance – Shift {shift}</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>
                <button
                  onClick={() => mark(emp._id, true)}
                  disabled={markedIds.includes(emp._id)}
                >
                  Present
                </button>
              </td>
              <td>
                <button
                  onClick={() => mark(emp._id, false)}
                  disabled={markedIds.includes(emp._id)}
                >
                  Absent
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendancePage;
