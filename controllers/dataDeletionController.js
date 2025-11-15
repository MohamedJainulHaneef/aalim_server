const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');
const Leave = require('../models/Leave');
const Substitution = require('../models/Substitution');
const Attendance = require('../models/Attendance');
const Academic = require('../models/Academic');
const Course = require('../models/Course');

// --------------------------------------------------------------------------------------------------------------

// Add Leave

const MODEL_MAP = { Student, Attendance, Academic, Leave, TimeTable, Substitution, Course };

const deleteData = async (req, res) => {

    try {

        const { tables, password } = req.body;

        const adminData = await Staff.findOne({ staffId: "ADMIN" });

        if (!password || password !== adminData.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid administrative password.",
            });
        }

        if (!Array.isArray(tables) || tables.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No tables selected for deletion.",
            });
        }

        let deletedCounts = [];

        for (const tableName of tables) {

            const model = MODEL_MAP[tableName];

            if (!model) {
                return res.status(400).json({
                    success: false,
                    message: `Unknown table: ${tableName}`,
                });
            }

            const result = await model.deleteMany({});
            deletedCounts.push({ table: tableName, deleted: result.deletedCount });
        }

        return res.json({
            success: true,
            message: "Selected tables deleted successfully.",
            deletedDetails: deletedCounts,
        });

    } catch (error) {
        console.error("Error deleting tables : ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error : " + error.message,
        });
    }
}


module.exports = { deleteData };