const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');
const Leave = require('../models/Leave');
const Substitution = require('../models/Substitution');
const Academic = require('../models/Academic')

// --------------------------------------------------------------------------------------------------------------

// Fetch Time Table based on Leave, Substitution

const timeTableFetch = async (req, res) => {

    const { staffId } = req.body;

    try {

        // console.log('Staff Id : ', staffId);

        //  Step 1: Get current date at UTC midnight
        const now = new Date();
        const currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        // console.log("Current Date : ", currentDate);

        //  Step 2: Check if today is a college leave
        const todayLeave = await Leave.findOne({
            leaveFromDate: { $lte: currentDate },
            leaveToDate: { $gte: currentDate }
        });

        if (todayLeave) { return res.status(200).json({ message: 'Today is a college leave', leave: todayLeave }) }

        //  Step 3: Find the academic year that includes currentDate
        const academic = await Academic.findOne({
            academicFromDate: { $lte: currentDate },
            academicToDate: { $gte: currentDate }
        });

        if (!academic) {
            // console.log('Academic period not found');
            return res.status(404).json({ message: "Academic period not found" });
        }

        //  Step 4: Get all leave dates from academic start to current date
        const allLeaves = await Leave.find({
            leaveToDate: { $gte: academic.academicFromDate },
            leaveFromDate: { $lte: currentDate }
        });

        //  Step 5: Convert leave ranges to set of leave days
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

        //  Step 6: Count working days to calculate day order
        let dayCounter = 0;
        const iterDate = new Date(Date.UTC(
            academic.academicFromDate.getUTCFullYear(),
            academic.academicFromDate.getUTCMonth(),
            academic.academicFromDate.getUTCDate()
        ));

        while (iterDate <= currentDate) {
            const isSunday = iterDate.getUTCDay() === 0;
            const isLeave = leaveDatesSet.has(iterDate.getTime());
            if (!isSunday && !isLeave) { dayCounter++ }
            iterDate.setUTCDate(iterDate.getUTCDate() + 1);
        }

        const dayOrder = dayCounter % 6 === 0 ? 6 : dayCounter % 6;
        // console.log("Day Order : ", dayOrder);

        // Time Table Fetching 
        const timeTable = await TimeTable.find({
            day_order: dayOrder,
            $or: [{ session_1: staffId }, { session_2: staffId }]
        })
        // console.log('Fetched Time Table : ', timeTable);

        const substitution = await Substitution.find({ absentStaffId: staffId, date: currentDate });
        // console.log('Substitution Class : ', substitution);

        const filteredTimeTable = timeTable.filter(t => {
            for (let s of substitution) {
                const sameYear = t.year === s.year;
                if (sameYear && s.session === 'I Hour' && t.session_1 === staffId) { return false }
                if (sameYear && s.session === 'II Hour' && t.session_2 === staffId) { return false }
            }
            return true;
        });
        // console.log('Filtered Time Table : ', filteredTimeTable);
    }
    catch (error) {
        // console.error("Server Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { timeTableFetch };