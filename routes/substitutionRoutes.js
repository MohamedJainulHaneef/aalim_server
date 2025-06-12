const express = require('express');
const router = express.Router();
const { substitutionAdd, substitutionStaffInfo, substitutionStaffId,
    substitutionInfo, substitutionDelete } = require('../controllers/substitutionController');

router.post('/StaffInfo', substitutionStaffInfo);
router.post('/StaffId', substitutionStaffId);
router.post('/addData', substitutionAdd);
router.post('/substitutionInfo', substitutionInfo);
router.delete('/deleteSubstitution', substitutionDelete);

module.exports = router;