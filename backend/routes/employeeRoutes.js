// backend/routes/employeeRoutes.js
// THIS IS THE FINAL CORRECTED CODE.

const express = require("express");
const router = express.Router();

const {
    createEmployee,
    getAllEmployees,
    getEmployeesByShift,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');

// --- THIS IS THE FIX ---
// Instead of importing the whole object, we get the 'protect' function from inside it.
const { protect } = require('../middleware/authMiddleware');

// Now, we use the 'protect' function as the middleware.
router.post("/", protect, createEmployee);
router.get("/", protect, getAllEmployees);
router.get("/shift/:shift", protect, getEmployeesByShift);
router.get("/:id", protect, getEmployeeById);
router.put("/:id", protect, updateEmployee);
router.delete("/:id", protect, deleteEmployee);

module.exports = router;