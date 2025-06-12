const Leave = require('../models/Leave');

// --------------------------------------------------------------------------------------------------------------

// Add Leave

const leaveAdd = async (req, res) => {

    const { leaveFromDate, leaveToDate, reason } = req.body;

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

// --------------------------------------------------------------------------------------------------------------

// Leave Details

const leaveInfo = async (req, res) => {

    try {
        const leaveDetails = await Leave.find();
        return res.json(leaveDetails)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Leave Edit

const leaveEdit = async (req, res) => {

    const { _id, leaveFromDate, leaveToDate, reason } = req.body;

    try {
        const updatedLeave = await Leave.findByIdAndUpdate(
            _id, { leaveFromDate, leaveToDate, reason }, { new: true } 
        );
        if (!updatedLeave) { return res.status(404).json({ message: 'Leave record not found' })}
        return res.json(updatedLeave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// --------------------------------------------------------------------------------------------------------------

// Leave Delete

const leaveDelete = async (req, res) => {

    const { id } = req.body;

    try {
        const deletedLeave = await Leave.findByIdAndDelete(id);
        if (!deletedLeave) { return res.status(404).json({ message: 'Leave record not found' }) }
        return res.json(deletedLeave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { leaveAdd, leaveInfo, leaveEdit, leaveDelete };