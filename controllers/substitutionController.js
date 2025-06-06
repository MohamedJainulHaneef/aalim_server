const Staff = require('../models/Staff');
const Substitution = require('../models/Substitution');

// --------------------------------------------------------------------------------------------------------------

// Fetch Staff Id for Substitution Dropdown

const substitutionStaffInfo = async (req, res) => {

    try {
        const staffIds = await Staff.find({}, 'staffId');
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
        const newSubstitution = new Substitution({  date, year, session, absentStaffId, replacementStaffId });
        await newSubstitution.save();
        return res.status(201).json({ message: 'Substitution Added Succesfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { substitutionAdd, substitutionStaffInfo };