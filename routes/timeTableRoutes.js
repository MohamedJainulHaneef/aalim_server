const express = require('express');
const router = express.Router();
const { timeTableFetch } = require('../controllers/timeTableController');

router.post('/staffClass' , timeTableFetch);

module.exports = router;