const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Add employee
router.post("/", async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get employee by ID
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
