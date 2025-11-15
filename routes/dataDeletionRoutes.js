const express = require('express');
const router = express.Router();
const { deleteData } = require('../controllers/dataDeletionController');

router.post('/deleteData', deleteData);

module.exports = router;