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
const auth = require('../middleware/authMiddleware');

// Define all routes
router.post("/", auth, createEmployee);
router.get("/", auth, getAllEmployees);
router.get("/shift/:shift", auth, getEmployeesByShift);
router.get("/:id", auth, getEmployeeById);
router.put("/:id", auth, updateEmployee);
router.delete("/:id", auth, deleteEmployee);

module.exports = router;