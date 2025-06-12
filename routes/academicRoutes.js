const express = require('express');
const router = express.Router();
const { academicAdd, academicFetch, academicEdit, academicDelete } = require('../controllers/academicController');

router.post('/addData', academicAdd);
router.post('/academicInfo', academicFetch);
router.put('/academicEdit', academicEdit);
router.delete('/deleteAcademic', academicDelete);

module.exports = router;