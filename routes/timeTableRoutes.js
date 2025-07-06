const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const TimeTable = require('../models/TimeTable');
const Student = require('../models/Student');
const { timeTableFetch } = require('../controllers/timeTableController');

router.post('/staffClass', timeTableFetch);

// --------------------------------------------------------------------------------------------------------------

// Time Table Uplaod

router.post('/timetable', upload.single('file'), async (req, res) => {

    try {
        const file = req.file;

        if (!file) { return res.status(400).send('File upload failed') }

        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        const expectedHeaders = ['day_order', 'year', 'session_1', 'session_2'];
        const firstRow = rows[0] || {};
        const actualHeaders = Object.keys(firstRow);

        const isValid = expectedHeaders.every(header => actualHeaders.includes(header));
        if (!isValid) {
            fs.unlinkSync(file.path);
            return res.status(400).send('Invalid file format. Please upload a file with correct headers.');
        }

        for (const row of rows) {
            const { day_order, year, session_1, session_2 } = row;
            if (!day_order || !year || !session_1 || !session_2) continue;
            await TimeTable.create({ day_order, year, session_1, session_2 })
        }

        fs.unlinkSync(file.path);
        res.status(200).send('Time Table File Imported Successfully');
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).send('Error while uploading time table');
    }
})

// --------------------------------------------------------------------------------------------------------------

// Student Uplaod

router.post('/studentupload', upload.single('file'), async (req, res) => {

    try {

        const file = req.file;
        if (!file) return res.status(400).send('No file uploaded');

        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const expectedHeaders = ['roll_no', 'reg_no', 'stu_name', 'year'];
        const actualHeaders = Object.keys(rows[0] || {});
        const isValid = expectedHeaders.every(header => actualHeaders.includes(header));
        if (!isValid) {
            fs.unlinkSync(file.path);
            return res.status(400).send('Invalid headers. Must include: roll_no, reg_no, stu_name, year');
        }

        for (const row of rows) {
            const { roll_no, reg_no, stu_name, year } = row;
            if (!roll_no) continue;
            await Student.findOneAndUpdate(
                { roll_no },
                { $set: { reg_no, stu_name, year } },
                { upsert: true, new: true }
            )
        }

        fs.unlinkSync(file.path);
        res.status(200).send('Student data imported successfully (inserted/updated by roll_no)');
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Error while uploading student file');
    }
})

module.exports = router;