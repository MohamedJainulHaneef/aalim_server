const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');
const Leave = require('../models/Leave');
const Substitution = require('../models/Substitution');
const Attendance = require('../models/Attendance');
const Academic = require('../models/Academic');
const Course = require('../models/Course')

// --------------------------------------------------------------------------------------------------------------

// Fetch Staff Id for Substitution Dropdown

const substitutionStaffInfo = async (req, res) => {

    try {
        const staffIds = await Staff.find({ staffId: { $ne: 'ADMIN' } }, 'staffId');
        return res.status(200).json(staffIds);
    } catch (error) {
        console.error('Error fetching staff info:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Add Substitution

const substitutionAdd = async (req, res) => {

    const { date, year, session, absentStaffId, replacementStaffId } = req.body;

    try {
        const exists = await Substitution.findOne({ date, year, session, absentStaffId, replacementStaffId });
        if (exists) return res.status(409).json(
            { message: 'Entry already exists for this substitution' }
        );
        const newSubstitution = new Substitution({ date, year, session, absentStaffId, replacementStaffId });
        await newSubstitution.save();
        return res.status(201).json({ message: 'Substitution Added Succesfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch StaffID for the Substitution Add

const substitutionStaffId = async (req, res) => {

    const { date, year, session } = req.body;

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

        if (!academic) { return res.status(404).json([{ message: "Academic period not found" }]) }

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
        const timeTable = await TimeTable.findOne({ day_order: dayOrder, year });

        let staffName = '';
        if (session === 'I Hour') staffName = timeTable.session_1;
        else { staffName = timeTable.session_2 }; res.json(staffName);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch StaffID for the Substitution Add

const substitutionInfo = async (req, res) => {

    try {
        const substitutionDetails = await Substitution.find();
        res.json(substitutionDetails)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch StaffID for the Substitution Add

const substitutionDelete = async (req, res) => {

    const { id } = req.body

    try {
        const deletedSubstitution = await Substitution.findByIdAndDelete(id);
        if (!deletedSubstitution) { return res.status(404).json({ message: 'Leave record not found' }) }
        return res.json(deletedSubstitution);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { substitutionAdd, substitutionStaffInfo, substitutionStaffId, substitutionInfo, substitutionDelete };