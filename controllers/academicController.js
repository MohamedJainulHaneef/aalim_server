const Academic = require('../models/Academic');

// --------------------------------------------------------------------------------------------------------------

// Add Academic Year

const academicAdd = async (req, res) => {

    const { academicFromDate, academicToDate, year, semester } = req.body;

    try {
        const exists = await Academic.findOne({ year, semester });
        if (exists) return res.status(409).json(
            { message: 'Entry already exists for this year and semester.' }
        );
        const newAcademic = new Academic({ academicFromDate, academicToDate, year, semester });
        await newAcademic.save();
        return res.status(201).json({ message: 'User Added Succesfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch Academic

const academicFetch = async (req, res) => {

    try {
        const academicDetails = await Academic.find();
        return res.json(academicDetails);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch Academic

const academicEdit = async (req, res) => {

    const { _id, academicFromDate, academicToDate, semester, year } = req.body;

    try {
        const academicUpdate = await Academic.findByIdAndUpdate(
            _id, { academicFromDate, academicToDate, semester, year }, { new: true } 
        )
        if (!academicUpdate) { return res.status(404).json({ message: 'Academic record not found' }) }
        return res.json(academicUpdate);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch Academic

const academicDelete = async (req, res) => {

    const { id } = req.body;

    try {
        const deletedAcademic = await Academic.findByIdAndDelete(id);
        if (!deletedAcademic) { return res.status(404).json({ message: 'Leave record not found' }) }
        return res.json(deletedAcademic);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { academicAdd, academicFetch, academicEdit, academicDelete };