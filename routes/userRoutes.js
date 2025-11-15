const express = require('express');
const router = express.Router();
const { loginStaff, addStaff, fetchStaff, editStaff, deleteStaff, changePassword } = require('../controllers/userController');

router.post('/login', loginStaff);
router.post('/addStaff', addStaff);
router.post('/fetchStaff', fetchStaff);
router.put('/editStaff', editStaff);
router.delete('/deleteStaff', deleteStaff);
router.post('/changePassword', changePassword);

module.exports = router;