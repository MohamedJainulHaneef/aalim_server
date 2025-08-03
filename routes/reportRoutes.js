const express = require('express');
const router = express.Router();
const { getStudentReport, getStaffReport } = require('../controllers/reportController');

router.post('/student', getStudentReport);
router.post('/staff', getStaffReport);

module.exports = router;