const express = require('express');
const router = express.Router();
const { leaveAdd } = require('../controllers/leaveController');

router.post('/addData', leaveAdd);

module.exports = router;