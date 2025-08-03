const Staff = require('../models/Staff');
const Student = require('../models/Student');
const TimeTable = require('../models/TimeTable');
const Leave = require('../models/Leave');
const Substitution = require('../models/Substitution');
const Attendance = require('../models/Attendance');
const Academic = require('../models/Academic');
const Course = require('../models/Course');

// --------------------------------------------------------------------------------------------------------------

// Student Report

const getStudentReport = async (req, res) => {

    try {

        const result = await Attendance.aggregate([
            { $unwind: "$record" },
            {
                $group: {
                    _id: "$record.roll_no", total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [{ $eq: ["$record.status", true] }, 1, 0]
                        }
                    },
                    absent: {
                        $sum: {
                            $cond: [{ $eq: ["$record.status", false] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "roll_no",
                    as: "studentInfo"
                }
            },
            {
                $unwind: "$studentInfo"
            },
            {
                $project: {
                    _id: 0,
                    roll_no: "$_id",
                    reg_no: "$studentInfo.reg_no",
                    total: 1,
                    present: 1,
                    absent: 1
                }
            },
            { $sort: { roll_no: 1 } }
        ])
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching attendance stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// --------------------------------------------------------------------------------------------------------------

// Staff Report

const getStaffReport = async (req, res) => {

    try {

        const result = await Staff.aggregate([
            {
                $lookup: {
                    from: "attendances",
                    localField: "staffId",
                    foreignField: "staffId",
                    as: "attendanceRecords"
                }
            },
            {
                $project: {
                    _id: 0,
                    staffId: 1,
                    fullName: 1,
                    attendanceCount: { $size: "$attendanceRecords" }
                }
            },
            { $sort: { staffId: 1 } }
        ]);
        console.log(result)
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching staff report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getStudentReport, getStaffReport }