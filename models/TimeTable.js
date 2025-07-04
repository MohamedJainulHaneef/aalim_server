const mongoose = require('mongoose');

const timeTableSchema = new mongoose.Schema({
    day_order: { type: Number, required: true },
    year: { type: String, required: true },
    session_1: { type: String, required: true },
    session_2: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('TimeTable', timeTableSchema);