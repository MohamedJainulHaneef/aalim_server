const express = require('express');
const router = express.Router();
const { substitutionAdd, substitutionStaffInfo } = require('../controllers/substitutionController');

router.post('/StaffInfo', substitutionStaffInfo);
router.post('/addData', substitutionAdd);

module.exports = router;