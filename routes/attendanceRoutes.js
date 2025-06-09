const express = require('express');
const router = express.Router();
const { studentInfo, attendanceSave } = require('../controllers/attendanceController');

router.post('/studentsInfo', studentInfo);
router.post('/saveInfo', attendanceSave);

module.exports = router;