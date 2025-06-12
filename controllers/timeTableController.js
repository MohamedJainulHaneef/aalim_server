const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');
const Leave = require('../models/Leave');
const Substitution = require('../models/Substitution');
const Attendance = require('../models/Attendance');
const Academic = require('../models/Academic');
const Course = require('../models/Course')

// --------------------------------------------------------------------------------------------------------------

// Fetch Time Table based on Leave, Substitution

const timeTableFetch = async (req, res) => {

    const { staffId } = req.body;

    try {

        const now = new Date();
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

        const timeTable = await TimeTable.find({
            day_order: dayOrder,
            $or: [{ session_1: staffId }, { session_2: staffId }]
        });

        const substitution = await Substitution.find({ replacementStaffId: staffId, date: currentDate });
        const substituted = await Substitution.find({ absentStaffId: staffId, date: currentDate });

        const filteredTimeTable = timeTable.filter(t => {
            for (let s of substituted) {
                const sameYear = t.year === s.year;
                if (sameYear && s.session === 'I Hour' && t.session_1 === staffId) return false;
                if (sameYear && s.session === 'II Hour' && t.session_2 === staffId) return false;
            }
            return true;
        });

        const classList = [];

        substitution.forEach(sub => { classList.push({ year: sub.year, session: sub.session }) });

        filteredTimeTable.forEach(t => {
            if (t.session_1 === staffId) { classList.push({ year: t.year, session: 'I Hour' }) }
            if (t.session_2 === staffId) { lassList.push({ year: t.year, session: 'II Hour' }) }
        });

        const currentAcademic = await Academic.findOne().sort({ academicFromDate: -1 }).lean();
        const semType = currentAcademic.semester;

        const enhancedClassList = await Promise.all(

            classList.map(async (cls) => {
                const course = await Course.findOne({ year: cls.year, sem_type: semType }).lean();
                const startOfDay = new Date(currentDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(currentDate);
                endOfDay.setHours(23, 59, 59, 999);

                const attendance = await Attendance.findOne({
                    staffId, year: cls.year,session: cls.session,
                    date: { $gte: startOfDay, $lte: endOfDay },
                }).lean();

                let total = 0, presentees = 0, absentees = 0;

                if (attendance?.record) {
                    total = attendance.record.length;
                    presentees = attendance.record.filter(r => r.status === true).length;
                    absentees = total - presentees;
                } else { total = (await Student.find({ year: cls.year })).length }

                return {
                    ...cls, total, presentees, absentees,
                    semester: course?.semester || 'N/A',
                    course_code: course?.courseCode || 'N/A',
                    course_title: course?.courseTitle || 'N/A',
                    
                }
            })
        )

        const staff = await Staff.findOne({ staffId }, 'fullName').lean();

        return res.status(200).json([{ staffName: staff?.fullName || 'N/A' }, ...enhancedClassList]);
    }
    catch (error) { res.status(500).json([{ message: 'Server error' }]) }
};


module.exports = { timeTableFetch };