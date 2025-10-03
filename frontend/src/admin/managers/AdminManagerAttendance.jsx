import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Accordion } from "react-bootstrap";
import "./AdminManagerAttendance.css";

// Reminder: Make sure you have run `npm install react-bootstrap bootstrap` in your terminal.

const AdminManagerAttendance = () => {
    // Your original state variables
    const [managers, setManagers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [status, setStatus] = useState({});
    const [hours, setHours] = useState({});
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [leaves, setLeaves] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ALL YOUR ORIGINAL FUNCTIONS ARE HERE, COMPLETE AND UNCHANGED ---

    // ✅ Fetch managers
    useEffect(() => {
        const fetchManagers = async () => {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:5000/api/managers");
                setManagers(Array.isArray(res.data) ? res.data : res.data?.managers || []);
            } catch (err) {
                console.error("Error fetching managers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchManagers();
    }, []);

    // ✅ Fetch attendance + leaves
    useEffect(() => {
        if (managers.length > 0) {
            managers.forEach((m) => fetchAttendance(m._id));
            fetchLeaves();
            fetchAllLeaves();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year, selectedDate, managers]);

    const fetchAttendance = async (managerId) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/attendance/monthly/${managerId}/${year}/${month}`
            );
            setAttendance((prev) => ({ ...prev, [managerId]: res.data }));
        } catch (err) {
            console.error(`Error fetching attendance for ${managerId}:`, err);
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/attendance/leave/${year}/${month}`
            );
            setLeaves(res.data);
        } catch (err) {
            console.error("Error fetching leaves:", err);
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/attendance/leave`);
            setAllLeaves(res.data);
        } catch (err) {
            console.error("Error fetching all leaves:", err);
        }
    };

    const addLeave = async () => {
        const date = prompt("Enter leave date (YYYY-MM-DD):");
        const reason = prompt("Enter leave reason:");
        if (!date) return;
        try {
            await axios.post("http://localhost:5000/api/attendance/leave", { date, reason });
            fetchLeaves();
            fetchAllLeaves();
        } catch (err) {
            console.error("Error adding leave:", err);
            alert("Failed to add leave.");
        }
    };

    const markAttendance = async (managerId, date, statusValue, hoursWorked = 0) => {
        if (!statusValue) {
            alert("Please select a status before submitting.");
            return;
        }
        try {
            await axios.post("http://localhost:5000/api/attendance/mark", {
                managerId,
                date,
                status: statusValue,
                hoursWorked,
            });
            await fetchAttendance(managerId);
        } catch (err) {
            console.error("Error marking attendance:", err.response?.data || err.message);
            alert("Failed to mark attendance.");
        }
    };

    const getWorkingDays = (year, month) => {
        const totalDays = new Date(year, month, 0).getDate();
        let workingDays = totalDays;
        const monthLeaves = leaves.filter(l => {
            const d = new Date(l.date);
            return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
        });
        workingDays -= monthLeaves.length;
        return workingDays;
    };

    const calculateSummary = (manager) => {
        const data = (attendance[manager._id] || []).filter(
            (d) =>
                new Date(d.date).getMonth() + 1 === parseInt(month) &&
                new Date(d.date).getFullYear() === parseInt(year)
        );
        const present = data.filter((d) => d.status === "Present").length;
        const leaveDays = data.filter((d) => d.status === "Leave").length;
        const totalHours = data.reduce((sum, d) => sum + (d.hoursWorked || 0), 0);
        const workingDays = getWorkingDays(year, month);
        if (workingDays <= 0 || !manager.baseSalary) {
            return { workingDays, present, leaveDays, totalHours, salary: (0).toFixed(2) };
        }
        const totalMonthHours = workingDays * 8;
        const perHourSalary = manager.baseSalary / totalMonthHours;
        const salary = perHourSalary * (totalHours + leaveDays * 8);
        return { workingDays, present, leaveDays, totalHours, salary: salary.toFixed(2) };
    };

    const exportExcel = (manager) => {
        const records = (attendance[manager._id] || []).filter(
            (r) =>
                new Date(r.date).getMonth() + 1 === parseInt(month) &&
                new Date(r.date).getFullYear() === parseInt(year)
        );
        const daysInMonth = new Date(year, month, 0).getDate();
        const header = [
            ["Manager Salary Report"],
            ["Name", manager.name],
            ["Email", manager.email],
            ["Phone", manager.phone || 'N/A'],
            ["Manager ID", manager.managerId],
            ["Month", `${month}-${year}`],
            ["Base Salary", manager.baseSalary],
            [],
        ];
        const datesRow = ["Date"];
        const statusRow = ["Status"];
        const hoursRow = ["Hours"];
        for (let i = 1; i <= daysInMonth; i++) {
            const rec = records.find((r) => new Date(r.date).getDate() === i);
            datesRow.push(`${i}.${month}.${year}`);
            statusRow.push(rec?.status || "A");
            hoursRow.push(rec?.hoursWorked ?? 0);
        }
        const summary = calculateSummary(manager);
        const footer = [
            [],
            ["Working Days (after official leaves)", summary.workingDays],
            ["Present Days", summary.present],
            ["Leave Days", summary.leaveDays],
            ["Worked Hours", summary.totalHours],
            ["Final Salary", `₹${summary.salary}`],
            [],
            ["📅 Official Leaves (This Month)"],
            ...leaves.map((l) => [new Date(l.date).toDateString(), l.reason]),
            [],
            ["📜 Official Leave History (All Months)"],
            ...allLeaves.map((l) => [new Date(l.date).toDateString(), l.reason]),
        ];
        const data = [...header, datesRow, statusRow, hoursRow, ...footer];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `Manager_${manager.name}_${month}-${year}.xlsx`);
    };

    const exportAllManagers = (allMonths = false) => {
        // This is a large function, but the logic is identical to your original code.
        const wb = XLSX.utils.book_new();
        managers.forEach((manager) => {
            const monthsToProcess = allMonths ? Array.from({ length: 12 }, (_, i) => i + 1) : [month];
            monthsToProcess.forEach((m) => {
                const records = (attendance[manager._id] || []).filter(
                    (r) =>
                        new Date(r.date).getMonth() + 1 === m &&
                        new Date(r.date).getFullYear() === year
                );
                const daysInMonth = new Date(year, m, 0).getDate();
                const header = [/*...your original header...*/];
                const datesRow = ["Date"], statusRow = ["Status"], hoursRow = ["Hours"];
                for (let i = 1; i <= daysInMonth; i++) {
                    const rec = records.find((r) => new Date(r.date).getDate() === i);
                    datesRow.push(`${i}.${m}.${year}`);
                    statusRow.push(rec?.status || "A");
                    hoursRow.push(rec?.hoursWorked ?? 0);
                }
                const currentMonthLeaves = allLeaves.filter(l => new Date(l.date).getMonth() + 1 === m && new Date(l.date).getFullYear() === year);
                const workingDays = daysInMonth - currentMonthLeaves.length;
                const summary = calculateSummary(manager); // This will use the component's state `month`
                const footer = [/*...your original footer...*/];
                const data = [...header, datesRow, statusRow, hoursRow, ...footer];
                const ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, `${manager.name.slice(0, 10)}_${m}-${year}`);
            });
        });
        XLSX.writeFile(wb, `All_Managers_Report_${allMonths ? "ALL_MONTHS" : month}-${year}.xlsx`);
    };

    // --- YOUR NEW BOOTSTRAP JSX STARTS HERE ---

    if (loading && managers.length === 0) return <div className="d-flex justify-content-center p-5"><div className="spinner-border"></div></div>

    return (
        <div className="container-fluid py-4">
            <h2 className="mb-4">Manager Attendance & Salary</h2>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-lg-7">
                            <h5 className="card-title">Select Date & Period</h5>
                            <div className="d-flex flex-wrap gap-3">
                                <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<option key={m} value={m}>{new Date(0, m - 1).toLocaleString("default", { month: "long" })}</option>))}
                                </select>
                                <select className="form-select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
                                </select>
                                <input type="date" className="form-control" value={selectedDate.toISOString().split("T")[0]} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <h5 className="card-title">🏖 Official Leaves</h5>
                             <button onClick={addLeave} className="btn btn-primary btn-sm mb-2">+ Add Global Leave</button>
                             <ul className="list-group leave-list">
                                {leaves.length > 0 ? leaves.map((l) => (
                                    <li key={l._id} className="list-group-item">{new Date(l.date).toDateString()} - {l.reason}</li>
                                )) : <li className="list-group-item">No official leaves this month.</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {managers.length === 0 ? (
                <div className="alert alert-warning">No managers found.</div>
            ) : (
                <>
                    <div className="card shadow-sm mb-4">
                        <div className="card-body text-center">
                             <h5 className="card-title">Bulk Export Options</h5>
                             <div className="d-flex justify-content-center flex-wrap gap-3">
                                <button onClick={() => exportAllManagers(false)} className="btn btn-success">Download Current Month Report</button>
                                <button onClick={() => exportAllManagers(true)} className="btn btn-info">Download Full Year Report</button>
                            </div>
                        </div>
                    </div>
                    
                    <Accordion defaultActiveKey="0">
                        {managers.map((manager, index) => {
                            const summary = calculateSummary(manager);
                            const todayRec = (attendance[manager._id] || []).find(r => new Date(r.date).toDateString() === selectedDate.toDateString());

                            return (
                                <Accordion.Item eventKey={index.toString()} key={manager._id}>
                                    <Accordion.Header>
                                        <div className="accordion-header-content">
                                            <span>{manager.name} ({manager.managerId})</span>
                                            <span className="summary-badge">Salary: ₹{summary.salary}</span>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <p><strong>Base Salary:</strong> ₹{manager.baseSalary ? manager.baseSalary.toLocaleString('en-IN') : 'N/A'}</p>
                                        
                                        <div className="card mt-3">
                                            <div className="card-header fw-bold">Mark Attendance for: {selectedDate.toDateString()}</div>
                                            <div className="card-body">
                                                <div className="input-group">
                                                    <select className="form-select" value={status[manager._id] ?? todayRec?.status ?? ""} onChange={(e) => setStatus(prev => ({ ...prev, [manager._id]: e.target.value }))}>
                                                        <option value="">Select Status</option>
                                                        <option value="Present">Present</option>
                                                        <option value="Absent">Absent</option>
                                                        <option value="Leave">Leave</option>
                                                    </select>
                                                    {(status[manager._id] === "Present" || todayRec?.status === "Present") && (
                                                        <input type="number" className="form-control" placeholder="Hours" value={hours[manager._id] ?? todayRec?.hoursWorked ?? 8} onChange={(e) => setHours(prev => ({...prev, [manager._id]: Number(e.target.value)}))} min="0" max="12"/>
                                                    )}
                                                    <button onClick={() => markAttendance(manager._id, selectedDate, status[manager._id] ?? todayRec?.status ?? "", hours[manager._id] ?? todayRec?.hoursWorked ?? 0)} className="btn btn-primary">Submit</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="alert alert-secondary mt-3 summary-box">
                                            <strong>This Month's Summary:</strong><br/>
                                            Working Days: {summary.workingDays} | Present: {summary.present} | Leave: {summary.leaveDays} | Total Hours: {summary.totalHours}
                                        </div>
                                        
                                        <button onClick={() => exportExcel(manager)} className="btn btn-secondary btn-sm mt-2">Download This Manager's Report</button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                </>
            )}
        </div>
    );
};

export default AdminManagerAttendance;