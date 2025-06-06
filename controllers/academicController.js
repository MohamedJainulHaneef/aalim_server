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

module.exports = { academicAdd };