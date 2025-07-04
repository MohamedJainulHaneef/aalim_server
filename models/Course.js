const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true, trim: true },
    courseTitle: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    handleStaffs: [String]
}, { timestamps: false });

module.exports = mongoose.model('Course', courseSchema);