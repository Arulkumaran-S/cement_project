// backend/routes/employeeRoutes.js
// THIS IS THE CORRECTED CODE. COPY AND PASTE THIS ENTIRE THING.
const express = require("express");
const router = express.Router();
const Employee = require('../models/Employee');
// This is the line that fixes the error by using { }
const { createEmployee, getAllEmployees, getEmployeesByShift, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../middleware/authMiddleware');

// The 'createEmployee' variable now correctly holds the function
router.post("/", auth, createEmployee);
router.get("/", auth, getAllEmployees);
router.get("/shift/:shift", auth, getEmployeesByShift);

// ✅ CHATBOT ROUTES
router.get("/count", auth, async (req, res) => {
    try {
        const count = await Employee.countDocuments();
        res.json({ count });
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});

router.get("/details/by-name/:name", auth, async (req, res) => {
    try {
        const employee = await Employee.findOne({ name: { $regex: new RegExp(`^${req.params.name}$`, "i") } });
        if (!employee) return res.status(404).json({ msg: 'Employee not found' });
        res.json(employee);
    } catch (err) { res.status(500).json({ error: "Server error" }); }
});
// ✅ END CHATBOT ROUTES

router.get("/:id", auth, getEmployeeById);
router.put("/:id", auth, updateEmployee);
router.delete("/:id", auth, deleteEmployee);

module.exports = router;