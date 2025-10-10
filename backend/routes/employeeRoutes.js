// A special debugging version of employeeRoutes.js
const express = require("express");
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// --- DEBUGGING STEP 1 ---
// Let's see what is actually being imported from the controller
const employeeController = require('../controllers/employeeController');
console.log("--- DEBUGGING --- This is the full employeeController object:", employeeController);

// --- DEBUGGING STEP 2 ---
// Now, let's destructure it and see what we get for each function
const {
    createEmployee,
    getAllEmployees,
    getEmployeesByShift,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = employeeController;

console.log("--- DEBUGGING --- Is 'createEmployee' a function?", typeof createEmployee);
console.log("--- DEBUGGING --- Is 'getAllEmployees' a function?", typeof getAllEmployees);
console.log("--- DEBUGGING --- Is 'getEmployeesByShift' a function?", typeof getEmployeesByShift);
console.log("--- DEBUGGING --- Is 'getEmployeeById' a function?", typeof getEmployeeById);
console.log("--- DEBUGGING --- Is 'updateEmployee' a function?", typeof updateEmployee);
console.log("--- DEBUGGING --- Is 'deleteEmployee' a function?", typeof deleteEmployee);
// --- END OF DEBUGGING STEPS ---


// Define all routes
router.post("/", auth, createEmployee);
router.get("/", auth, getAllEmployees);
router.get("/shift/:shift", auth, getEmployeesByShift);
router.get("/:id", auth, getEmployeeById);
router.put("/:id", auth, updateEmployee);
router.delete("/:id", auth, deleteEmployee);

module.exports = router;