import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../utils/api';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(0);

  useEffect(() => {
    API.get(`/employees/${id}`).then((res) => {
      const emp = res.data;
      setEmployee(emp);

      const days = emp.attendance?.length || 0;
      const rate = emp.experience >= 5 ? 1600 : 800;
      setSalary(days * rate);
    });
  }, [id]);

  if (!employee) return <p>Loading...</p>;

  return (
    <div>
      <h3>Employee Details</h3>
      <p><strong>Name:</strong> {employee.name}</p>
      <p><strong>Phone:</strong> {employee.phone}</p>
      <p><strong>Experience:</strong> {employee.experience} years</p>
      <p><strong>Days Present:</strong> {employee.attendance?.length}</p>
      <p><strong>Calculated Salary:</strong> ₹{salary}</p>
    </div>
  );
};

export default EmployeeDetails;
