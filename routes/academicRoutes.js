const express = require('express');
const router = express.Router();
const { academicAdd } = require('../controllers/academicController');

router.post('/addData', academicAdd);

module.exports = router;