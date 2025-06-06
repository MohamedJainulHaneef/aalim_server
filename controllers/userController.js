const Staff = require('../models/Staff');

// --------------------------------------------------------------------------------------------------------------

// Login Staff

const loginStaff = async (req, res) => {

    const { staffId, password } = req.body;

    try {
        const user = await Staff.findOne({ staffId });
        if (!user) { return res.status(401).json({ message: 'Invalid User Id' }) }
        if (user.password !== password) { return res.status(401).json({ message: 'Invalid Password' }) }
        res.status(200).json({ message: 'Login Successful', staffId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Add Staff

const addStaff = async (req, res) => {

    const { staffId, fullName, password } = req.body;s

    try {
        const userExists = await Staff.findOne({ staffId });
        if (userExists) return res.status(401).json({ message: 'staffId already Exist' })
        const newUser = new Staff({ staffId, fullName, password });
        await newUser.save();
        return res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Fetch Staff

const fetchStaff = async (req, res) => {

    try {
        const users = await Staff.find();
        res.json(users);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

// --------------------------------------------------------------------------------------------------------------

// Edit Staff

const editStaff = async (req, res) => {

    const { staffId, fullName, password } = req.body;
    console.log( staffId, fullName, password );

    try {
        const user = await Staff.findOneAndUpdate(
            { staffId }, { fullName, password }, { new: true }
        )
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updaing user' });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Delete Staff

const deleteStaff = async (req, res) => {
    
    const { id } = req.body;

    try {
        const user = await Staff.findOneAndDelete({ staffId: id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = { loginStaff, addStaff, fetchStaff, editStaff, deleteStaff };