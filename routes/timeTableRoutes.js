const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const TimeTable = require('../models/TimeTable');
const Student = require('../models/Student');
const Course = require('../models/Course');
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

            const cleanRow = {};
            Object.keys(row).forEach(key => { cleanRow[key] = typeof row[key] === "string" ? row[key].trim() : row[key] });
            const { day_order, year, session_1, session_2 } = cleanRow;
            if (!day_order || !year || !session_1 || !session_2) continue;
            await TimeTable.create({ day_order, year, session_1, session_2 });
        }

        fs.unlinkSync(file.path);
        res.status(200).send('Timetable file imported successfully');
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).send('Error while uploading timetable');
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

            const cleanRow = {};
            Object.keys(row).forEach(key => {
                cleanRow[key] = typeof row[key] === "string"
                    ? row[key].trim()
                    : row[key];
            });

            const { roll_no, reg_no, stu_name, year } = cleanRow;

            if (!roll_no) continue;

            await Student.findOneAndUpdate(
                { roll_no },
                { $set: { reg_no, stu_name, year } },
                { upsert: true, new: true }
            );
        }

        fs.unlinkSync(file.path);
        res.status(200).send('Student data imported successfully');
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Error while uploading student file');
    }
})

// --------------------------------------------------------------------------------------------------------------

// Course File Uplaod

router.post('/courseupload', upload.single('file'), async (req, res) => {

    try {

        const file = req.file;
        if (!file) return res.status(400).send("No file uploaded");

        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rows.length === 0) {
            fs.unlinkSync(file.path);
            return res.status(400).send("Excel file is empty");
        }

        const baseHeaders = ["courseCode", "courseTitle", "year", "semester"];
        const actualHeaders = Object.keys(rows[0]);

        const isValid = baseHeaders.every(h => actualHeaders.includes(h));
        if (!isValid) {
            fs.unlinkSync(file.path);
            return res.status(400).send(
                "Invalid Course File. Must include: courseCode, courseTitle, year, semester"
            );
        }

        for (const row of rows) {

            const cleanRow = {};
            Object.keys(row).forEach(key => {
                cleanRow[key] = typeof row[key] === "string"
                    ? row[key].trim()
                    : row[key];
            });

            const { courseCode, courseTitle, year, semester } = cleanRow;

            if (!courseCode) continue;

            const handleStaffs = Object.keys(cleanRow)
                .filter(k => k.startsWith("handleStaffs"))
                .map(k => cleanRow[k])
                .filter(v => v && v.trim() !== ""); 

            await Course.findOneAndUpdate(
                { courseCode },
                {
                    $set: {
                        courseTitle,
                        year,
                        semester,
                        handleStaffs
                    }
                },
                { upsert: true, new: true }
            );
        }

        fs.unlinkSync(file.path);
        res.status(200).send("Course file imported successfully");
    } catch (err) {
        console.error("Course Upload Error:", err);
        res.status(500).send("Error while uploading course file");
    }
});

// --------------------------------------------------------------------------------------------------------------

module.exports = router;