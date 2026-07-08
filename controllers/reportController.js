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
                    _id: "$record.roll_no", 
                    total: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ["$record.status", true] }, 1, 0] }
                    },
                    absent: {
                        $sum: { $cond: [{ $eq: ["$record.status", false] }, 1, 0] }
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
                $unwind: {
                    path: "$studentInfo",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $addFields: {
                    yearOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$studentInfo.year", "I Year"] }, then: 1 },
                                { case: { $eq: ["$studentInfo.year", "II Year"] }, then: 2 },
                                { case: { $eq: ["$studentInfo.year", "III Year"] }, then: 3 },
                                { case: { $eq: ["$studentInfo.year", "IV Year"] }, then: 4 },
                                { case: { $eq: ["$studentInfo.year", "V Year"] }, then: 5 }
                            ],
                            default: 6 
                        }
                    }
                }
            },
            { 
                $sort: { 
                    "yearOrder": 1, 
                    "_id": 1 
                } 
            }, 
            {
                $project: {
                    _id: 0,
                    roll_no: "$_id",
                    reg_no: { $ifNull: ["$studentInfo.reg_no", "N/A"] },
                    stu_name: { $ifNull: ["$studentInfo.stu_name", "Unknown"] },  
                    year: { $ifNull: ["$studentInfo.year", "Unknown Year"] },
                    total: 1,
                    present: 1,
                    absent: 1
                }
            }
        ]);
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
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching staff report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getStudentReport, getStaffReport }