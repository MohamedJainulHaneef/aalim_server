const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Academic = require('../models/Academic')
const Leave = require('../models/Leave')
const Timetable = require('../models/TimeTable')
const Substitution = require('../models/Substitution')
const Course = require('../models/Course')
const TimeTable = require('../models/TimeTable');

// --------------------------------------------------------------------------------------------------------------

// Student Details

const studentInfo = async (req, res) => {

    const { studentYear, session, formattedDate, staffId } = req.body;

    try {
        const [day, month, year] = formattedDate.split('.');
        const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
        const attendanceRecord = await Attendance.findOne({
            year: studentYear, session, date: { $gte: startOfDay, $lte: endOfDay }, staffId
        })
        if (attendanceRecord) {
            const fullInfo = await Student.find({ year: studentYear });
            const enrichedRecord = attendanceRecord.record.map((student) => {
                const studentDetails = fullInfo.find(s => s.roll_no === student.roll_no);
                return {
                    ...student.toObject(),
                    reg_no: studentDetails?.reg_no || null,
                    stu_name: studentDetails?.stu_name || null
                }
            })
            return res.json(enrichedRecord)
        }
        const students = await Student.find({ year: studentYear });
        const studentData = students.map((student) => ({
            reg_no: student.reg_no, roll_no: student.roll_no, status: true, stu_name: student.stu_name
        }))
        return res.json(studentData);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Attendance Save

const attendanceSave = async (req, res) => {

    const { year, session, date, staffId, record, courseCode } = req.body;

    try {
        const dateObj = new Date(date);
        const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
        const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

        const existingAttendance = await Attendance.findOne({
            year, session, staffId, date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            existingAttendance.record = record;
            await existingAttendance.save();
            return res.status(200).json({ message: 'Attendance updated successfully' });
        } else {
            const newAttendance = new Attendance({ year, session, date: new Date(date), staffId, record, courseCode });
            await newAttendance.save();
            return res.status(201).json({ message: 'Attendance saved successfully' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Student Information for Admin Attendance Management 

const stuInfo = async (req, res) => {

    try {

        const { date, year, session } = req.body;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await Attendance.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }, year, session
        });

        if (!result) {
            const students = await Student.find({ year }).select('roll_no reg_no stu_name -_id');
            const records = students.map(s => ({
                roll_no: s.roll_no, reg_no: s.reg_no,
                stu_name: s.stu_name, status: true
            }));
            return res.status(200).json({ records });
        }

        const rollNumbers = result.record.map(r => r.roll_no);

        const students = await Student.find({ roll_no: { $in: rollNumbers } }).select('roll_no reg_no stu_name -_id');

        const statusMap = {};
        result.record.forEach(r => { statusMap[r.roll_no] = r.status });

        const records = students.map(s => ({
            roll_no: s.roll_no,
            reg_no: s.reg_no,
            stu_name: s.stu_name,
            status: statusMap[s.roll_no]
        }));

        return res.status(200).json({ records });

    } catch (error) {
        console.error('Error in Student Info :', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Student Information for Admin Attendance Management 

const saveAttendance = async (req, res) => {

    try {

        const { date, year, session, record } = req.body;

        const inputDate = new Date(date);
        const currentDate = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate()));
        const startOfDay = new Date(currentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(currentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existing = await Attendance.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }, year, session
        });

        if (!existing) {

            const todayLeave = await Leave.findOne({
                leaveFromDate: { $lte: currentDate },
                leaveToDate: { $gte: currentDate }
            })
            if (todayLeave) {
                return res.status(200).json([{ message: 'Today is a college leave', leave: todayLeave }]);
            }

            const academic = await Academic.findOne({
                academicFromDate: { $lte: currentDate },
                academicToDate: { $gte: currentDate }
            });

            if (!academic) {
                return res.status(404).json([{ message: "Academic period not found" }]);
            }

            const allLeaves = await Leave.find({
                leaveToDate: { $gte: academic.academicFromDate },
                leaveFromDate: { $lte: currentDate }
            });

            const leaveDatesSet = new Set();
            allLeaves.forEach(leave => {
                let d = new Date(leave.leaveFromDate);
                d.setUTCHours(0, 0, 0, 0);
                const to = new Date(leave.leaveToDate);
                to.setUTCHours(0, 0, 0, 0);
                while (d <= to) {
                    leaveDatesSet.add(d.getTime());
                    d.setUTCDate(d.getUTCDate() + 1);
                }
            });

            let dayCounter = 0;
            const iterDate = new Date(Date.UTC(
                academic.academicFromDate.getUTCFullYear(),
                academic.academicFromDate.getUTCMonth(),
                academic.academicFromDate.getUTCDate()
            ));

            while (iterDate <= currentDate) {
                const isSunday = iterDate.getUTCDay() === 0;
                const isLeave = leaveDatesSet.has(iterDate.getTime());
                if (!isSunday && !isLeave) dayCounter++;
                iterDate.setUTCDate(iterDate.getUTCDate() + 1);
            }

            const dayOrder = dayCounter % 6 === 0 ? 6 : dayCounter % 6;

            const timetable = await Timetable.findOne({ day_order: dayOrder, year });

            let staffId;
            if (session === 'I Hour' && timetable) staffId = timetable.session_1;
            else if (session === 'II Hour' && timetable) staffId = timetable.session_2;

            if (!staffId) {
                return res.status(404).json({ message: 'Staff not found for session' });
            }

            const substitution = await Substitution.findOne({
                absentStaffId: staffId, year, session,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            const course = await Course.findOne({ year, handleStaffs: staffId }).select('courseCode');

            if (!course) { return res.status(404).json({ message: 'Course not found for staff' }) }

            if (substitution) staffId = substitution.replacementStaffId;

            const newAttendance = new Attendance({
                staffId, year, date: currentDate, session,
                courseCode: course.courseCode, record
            });

            await newAttendance.save();

            return res.status(201).json({ message: 'Attendance created successfully', data: newAttendance });
        }

        existing.record = record;
        await existing.save();
        return res.status(200).json({ message: 'Attendance updated successfully', data: existing });

    } catch (error) {
        console.error('Error saving attendance for Admin : ', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Student Information for Admin Attendance Management 

const attendanceReport = async (req, res) => {

    const { date } = req.body;

    try {

        const now = new Date(date);
        const currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        const todayLeave = await Leave.findOne({
            leaveFromDate: { $lte: currentDate },
            leaveToDate: { $gte: currentDate }
        });

        if (todayLeave) { return res.status(200).json([{ message: 'Today is a college leave', leave: todayLeave }]) }

        const academic = await Academic.findOne({
            academicFromDate: { $lte: currentDate },
            academicToDate: { $gte: currentDate }
        });

        if (!academic) {
            return res.status(404).json([{ message: "Academic period not found" }]);
        }

        const allLeaves = await Leave.find({
            leaveToDate: { $gte: academic.academicFromDate },
            leaveFromDate: { $lte: currentDate }
        });

        const leaveDatesSet = new Set();
        allLeaves.forEach(leave => {
            let d = new Date(leave.leaveFromDate);
            d.setUTCHours(0, 0, 0, 0);
            const to = new Date(leave.leaveToDate);
            to.setUTCHours(0, 0, 0, 0);
            while (d <= to) {
                leaveDatesSet.add(d.getTime());
                d.setUTCDate(d.getUTCDate() + 1);
            }
        });

        let dayCounter = 0;
        const iterDate = new Date(Date.UTC(
            academic.academicFromDate.getUTCFullYear(),
            academic.academicFromDate.getUTCMonth(),
            academic.academicFromDate.getUTCDate()
        ));

        while (iterDate <= currentDate) {
            const isSunday = iterDate.getUTCDay() === 0;
            const isLeave = leaveDatesSet.has(iterDate.getTime());
            if (!isSunday && !isLeave) dayCounter++;
            iterDate.setUTCDate(iterDate.getUTCDate() + 1);
        }

        const dayOrder = dayCounter % 6 === 0 ? 6 : dayCounter % 6;

        const timeTable = await TimeTable.find({ day_order: dayOrder });

        let staffIds = [];

        timeTable.forEach(({ session_1, session_2, year }) => {
            staffIds.push({ staffId: session_1, year, session: 'I Hour', status: false });
            staffIds.push({ staffId: session_2, year, session: 'II Hour', status: false });
        });

        const updatedStaffIds = await Promise.all(
            staffIds.map(async (item) => {
                const substituted = await Substitution.findOne({
                    absentStaffId: item.staffId, date: date,
                    year: item.year, session: item.session
                })
                if (substituted) { return { ...item, staffId: substituted.replacementStaffId } }
                return item;
            })
        )

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const filteredStatusCheck = [];

        for (const item of updatedStaffIds) {
            const status = await Attendance.findOne({
                year: item.year, staffId: item.staffId,
                session: item.session,
                date: { $gte: startOfDay, $lte: endOfDay }
            })
            if (!status) { filteredStatusCheck.push(item) }
        }

        return res.status(200).json({ success: true, data: filteredStatusCheck });

    } catch (error) {
        console.error("Error in Attendance Report:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

module.exports = { studentInfo, attendanceSave, stuInfo, saveAttendance, attendanceReport };