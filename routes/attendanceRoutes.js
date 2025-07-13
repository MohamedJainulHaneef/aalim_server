const express = require('express');
const router = express.Router();
const { studentInfo, attendanceSave } = require('../controllers/attendanceController');
const { stuInfo, saveAttendance, attendanceReport } = require('../controllers/attendanceController');

router.post('/studentsInfo', studentInfo);
router.post('/saveInfo', attendanceSave);
router.post('/attmanform', stuInfo);
router.post('/save-attendance', saveAttendance);
router.post('/report',attendanceReport)

module.exports = router;