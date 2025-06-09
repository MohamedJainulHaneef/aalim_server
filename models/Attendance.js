const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    staffId: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    date: { type: Date, required: true },
    session: { type: String, required: true },
    record: [{ roll_no: { type: String }, status: { type: Boolean } }]
}, { timestamps: false });


module.exports = mongoose.model('Attendance', attendanceSchema);
