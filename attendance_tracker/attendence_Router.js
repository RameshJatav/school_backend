const express = require("express");
const router = express.Router();
const attendanceController = require("./attendence_Controller")

router.post('/craeteAttendance', attendanceController.markAttendance)
router.get("/getAttendance", attendanceController.getAttendance)
router.post('/bulkAttendance', attendanceController.markBulkAttendance)
router.get("/class-report", attendanceController.getClassAttendanceReport);

module.exports = router;
