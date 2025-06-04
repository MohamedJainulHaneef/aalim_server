const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');

// --------------------------------------------------------------------------------------------------------------

// Fetch Classes based on Staff Id

const timeTableFetch = async (req, res) => {

    const { staffId } = req.body;

    try {
        const classes = await TimeTable.find({ $or: [{ session_1: staffId }, { session_2: staffId }] });
        const staffInfo = await Staff.findOne({ staffId })
        const finalData = { staffName: staffInfo.fullName, classes };
        if (!classes) return res.status(201).json({ message: 'No classes found.' })
        res.json(finalData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' })
    }
}

module.exports = { timeTableFetch };