const Leave = require('../models/Leave');

// --------------------------------------------------------------------------------------------------------------

// Add Leave

const leaveAdd = async (req, res) => {

    const { leaveFromDate, leaveToDate, reason } = req.body;
    console.log(req.body)

    try {
        const exists = await Leave.findOne({ leaveFromDate, leaveToDate, reason });
        if (exists) return res.status(409).json(
            { message: 'Entry already exists.' }
        );
        const newLeave = new Leave({ leaveFromDate, leaveToDate, reason });
        await newLeave.save();
        return res.status(201).json({ message: 'Leave Added Succesfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { leaveAdd };