const Student = require('../models/Student');
const Attendance = require('../models/Attendance')

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

    const { year, session, date, staffId, record } = req.body;

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
            const newAttendance = new Attendance({ year, session, date: new Date(date), staffId, record });
            await newAttendance.save();
            return res.status(201).json({ message: 'Attendance saved successfully' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { studentInfo, attendanceSave };