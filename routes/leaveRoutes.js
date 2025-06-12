const express = require('express');
const router = express.Router();
const { leaveAdd, leaveInfo, leaveEdit, leaveDelete } = require('../controllers/leaveController');

router.post('/addData', leaveAdd);
router.post('/leaveInfo', leaveInfo);
router.put('/leaveEdit', leaveEdit);
router.delete('/deleteLeave', leaveDelete);

module.exports = router;