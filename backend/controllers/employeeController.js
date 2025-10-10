const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
    try {
        const emp = await Employee.create(req.body);
        res.status(201).json(emp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        if (!emp) return res.status(404).json({ msg: 'Not found' });
        res.json(emp);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// THIS IS THE NEW FUNCTION THAT WAS MISSING
exports.getEmployeesByShift = async (req, res) => {
    try {
        const { shift } = req.params;
        // Find all employees where the 'shift' field matches the one from the URL
        const employees = await Employee.find({ shift: shift });
        
        if (!employees || employees.length === 0) {
            return res.status(404).json({ msg: `No employees found for shift: ${shift}` });
        }
        
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};