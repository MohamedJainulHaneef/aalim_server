const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    roll_no: { type: String, required: true, unique: true, trim: true },
    reg_no: { type: String, required: true },
    stu_name: { type: String, required: true },
    year: { type: String, required: true
    }
}, { timestamps: false });

module.exports = mongoose.model('Student', studentSchema);