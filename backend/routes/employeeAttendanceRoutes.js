const express = require('express');
const router = express.Router();
const {
    markBulkAttendance,
    getAttendanceByEmployee,
    getAttendanceByDate
} = require('../controllers/employeeAttendanceController');

// THIS IS THE FIX: We get the 'protect' function and rename it to 'auth' for use in your routes.
const { protect: auth } = require('../middleware/authMiddleware');

// @route   POST api/employee-attendance/bulk
// @desc    Mark or update attendance for multiple employees
// @access  Private (Requires token)
router.post('/bulk', auth, markBulkAttendance);

// @route   GET api/employee-attendance/:employeeId
// @desc    Get all attendance for a specific employee
// @access  Private (Requires token)
router.get('/:employeeId', auth, getAttendanceByEmployee);

// @route   GET api/employee-attendance/date/:date
// @desc    Get all attendance for a specific date
// @access  Private (Requires token)
router.get('/date/:date', auth, getAttendanceByDate);

module.exports = router;