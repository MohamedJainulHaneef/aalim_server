const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
    academicFromDate: { type: Date, required: true },
    academicToDate: { type: Date, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('Academic', academicSchema);
